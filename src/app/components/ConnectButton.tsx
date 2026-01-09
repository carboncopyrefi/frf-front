import { useAppKit, useAppKitAccount, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react'

export default function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { walletInfo } = useWalletInfo();
  const ROOT_URL = import.meta.env.VITE_ROOT_URL;

  const image = "blob:" + ROOT_URL + "/ee9dd529-d140-4245-ac74-badafe1ca3d0"
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open()}
          className="border border-indigo-600 hover:bg-indigo-700 text-indigo-600 hover:text-white text-sm font-medium py-1.5 px-3 rounded-full cursor-pointer flex items-center gap-2"
        >
          <img src={image} className="w-4 h-4 rounded-full" alt="Network logo" />
            <img
              src={walletInfo?.icon}
              alt="Wallet logo"
              className="w-4 h-4 rounded-full"
            />
          <span className="text-sm font-medium">
            {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="border border-indigo-600 hover:border-indigo-700 text-indigo-600 hover:text-indigo-700 text-sm font-medium py-1.5 px-3 rounded-full cursor-pointer"
    >
      Connect Wallet
    </button>
  )
}