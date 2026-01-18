import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { optimism } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_REOWN_ID
if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const metadata = {
  name: 'Funding Readiness Framework by CARBON Copy',
  description: 'The Funding Readiness Framework is an open-source project developed by CARBON Copy to help Web3 ecosystems and grant round operators understand which projects are ready for growth-level funding.',
  url: 'https://frf.carboncopy.news',
  icons: ['https://carboncopy.news/images/logo.png']
}
export const networks = [optimism] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig