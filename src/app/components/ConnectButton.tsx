import { useAppKit, useAppKitAccount, useWalletInfo, useAppKitNetwork } from '@reown/appkit/react'
import { Wallet } from 'lucide-react';

export default function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { walletInfo } = useWalletInfo();
  const { caipNetwork } = useAppKitNetwork();
  const VITE_REOWN_ID = import.meta.env.VITE_REOWN_ID;

  const networkImage = caipNetwork?.assets?.imageUrl || 
    (caipNetwork?.assets?.imageId ? 
      `https://explorer-api.walletconnect.com/v3/logo/lg/${caipNetwork.assets.imageId}?projectId=${VITE_REOWN_ID}` : 
      null)

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open()}
          className="hidden md:flex border border-indigo-600 hover:bg-indigo-700 text-indigo-600 hover:text-white text-sm font-medium py-1.5 px-3 rounded-full cursor-pointer flex items-center gap-2"
        >
          {networkImage && (
            <img src={networkImage} className="w-4 h-4 rounded-full" alt="Network logo" />
          )}
          <img
            src={walletInfo?.icon}
            alt="Wallet logo"
            className="w-4 h-4 rounded-full"
          />
          <span className="text-sm font-medium">
            {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </button>
        <button
          onClick={() => open()}
          className="md:hidden bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition cursor-pointer"
        >
          {networkImage && (
            <img src={networkImage} className="w-6 h-6 rounded-full" alt="Network logo" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div>
    <button
      onClick={() => open()}
      className="hidden md:block border border-indigo-600 hover:border-indigo-700 text-indigo-600 hover:text-indigo-700 text-sm font-medium py-1.5 px-3 rounded-full cursor-pointer"
    >
      Connect Wallet
    </button>

    <button
      onClick={() => open()}
      className="md:hidden bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition cursor-pointer"
    >
      <Wallet />
    </button>

    </div>
    
  )
}