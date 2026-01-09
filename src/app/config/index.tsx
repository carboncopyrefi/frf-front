import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { optimism } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_REOWN_ID
if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const metadata = {
  name: 'Funding Readiness Framework by CARBON Copy',
  description: 'Evaluations on Optimism',
  url: 'https://frf-front.vercel.app',
  icons: ['https://carboncopy.news/favicon.png']
}
export const networks = [optimism] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig