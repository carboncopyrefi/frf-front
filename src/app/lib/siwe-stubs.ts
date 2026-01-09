import type { AppKitNetwork } from '@reown/appkit/networks'
import {
    type SIWESession,
    type SIWEVerifyMessageArgs,
    type SIWECreateMessageArgs,
    createSIWEConfig,
    formatMessage,
  } from '@reown/appkit-siwe'
import { getAddress } from 'viem';
import { useAuthStore } from './auth'
  

const BASE_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_PROD_URL 
    : import.meta.env.VITE_API_DEV_URL ?? 'http://localhost:8000'; 

// Normalize the address (checksum)
const normalizeAddress = (address: string): string => {
  try {
    const splitAddress = address.split(':');
    const extractedAddress = splitAddress[splitAddress.length - 1];
    const checksumAddress = getAddress(extractedAddress);
    splitAddress[splitAddress.length - 1] = checksumAddress;
    const normalizedAddress = splitAddress.join(':');

    return normalizedAddress;
  } catch (error) {
    return address;
  }
}

// call the server to get a nonce
 const getNonce = async () : Promise<string> => {
    const res = await fetch(BASE_URL + "/nonce", {
        method: "POST",
        credentials: 'include',
      });
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const nonce = await res.json();
    return nonce.nonce;
}
  
// call the server to verify the message
 const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
        const response = await fetch(BASE_URL + "/verify", {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({ message, signature }),
            credentials: 'include'
        });

        if (!response.ok) {
            return false;
        }
        
        const result = await response.json();
        localStorage.setItem("siwe-jwt", result.token);
        useAuthStore.setState({ authenticated: true, role: result.role })
        return result;
      } catch (error) {
        return false;
      }
}

// call the server to get the session
const getSession = async (): Promise<SIWESession | null> => {
  // 1. prefer local JWT
  const token = localStorage.getItem("siwe-jwt");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (Date.now() > payload.exp * 1000) {        // expired
        localStorage.removeItem("siwe-jwt");
        return null;
      }
      return { address: payload.sub, chainId: 10 };
    } catch {
      localStorage.removeItem("siwe-jwt");
    }
  }

  // 2. fallback to cookie-based session
  const res = await fetch(BASE_URL + "/session", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok || res.status === 204) return null;

  const data = await res.json();
  const ok = typeof data === 'object' && typeof data.address === 'string' && typeof data.chainId === 'number';
  return ok ? (data as SIWESession) : null;
};

// call the server to sign out
const signOut =  async (): Promise<boolean> => {
  const res = await fetch(BASE_URL + "/signout", {
   method: "POST",
   credentials: 'include',
  });
  if (!res.ok) {
      throw new Error('Network response was not ok');
  }
 
  const data = await res.json();
  localStorage.removeItem("siwe-jwt"); 
  useAuthStore.setState({ authenticated: false, role: null })
  return Object.keys(data).length === 0
} 

export const createSIWE = (chains: [AppKitNetwork, ...AppKitNetwork[]]) => {
    return createSIWEConfig({
      signOutOnAccountChange: true,
      signOutOnNetworkChange: true,
        getMessageParams: async () => ({
              domain: window.location.host,
              uri: window.location.origin, 
              chains: chains.map((chain: AppKitNetwork) => parseInt(chain.id.toString())),
              statement: 'Welcome to the Funding Readiness Framework by CARBON Copy! Please sign this message',
            }),
        createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
          // normalize the address in case you are not using our library in the backend
          return formatMessage(args, normalizeAddress(address))
        },
        getNonce,
        getSession,
        verifyMessage,
        signOut,
    })
}