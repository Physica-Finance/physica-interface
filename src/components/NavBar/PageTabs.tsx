import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { chainIdToBackendName } from 'graphql/data/util'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import { useAtomValue } from 'jotai/utils'
import { Box } from 'nft/components/Box'
import { useLocation } from 'react-router-dom'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'

import { MenuItem } from '.'
import { MenuDropdown } from './MenuDropdown'

export const PageTabs = () => {
  const { pathname } = useLocation()
  const { chainId: connectedChainId } = useWeb3React()
  const chainName = chainIdToBackendName(connectedChainId)

  const isPoolActive = useIsPoolsPage()
  const isNftPage = useIsNftPage()

  const shouldDisableNFTRoutes = useAtomValue(shouldDisableNFTRoutesAtom)

  return (
    <>
      <MenuItem href="/#/swap" isTarget={false}>
        <Trans>Swap</Trans>
      </MenuItem>
      <MenuItem href="/#/pools" isTarget={false}>
        <Trans>Pools</Trans>
      </MenuItem>
      <MenuItem href="https://swap.deltaswap.io/#/transfer" isTarget={true}>
        <Trans>Bridge</Trans>
      </MenuItem>
      <MenuItem href="https://restake.app/" isTarget={true}>
        <Trans>Stake $PLQ</Trans>
      </MenuItem>
      <Box marginY={{ sm: '4', md: 'unset' }}>
        <MenuDropdown />
      </Box>
    </>
  )
}
