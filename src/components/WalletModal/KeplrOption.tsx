import { Connector } from '@web3-react/types'
import { keplrConnection } from 'connection'
import { getConnectionName, getIsKeplrWallet } from 'connection/utils'
import KEPLR_ICON_URL from 'assets/images/keplr.png'
import Option from './Option'

const BASE_PROPS = {
  color: '#8b6914',
  icon: KEPLR_ICON_URL,
  id: 'keplr-option',
}

export function KeplrOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  return (
    <Option
      {...BASE_PROPS}
      isActive={keplrConnection.hooks.useIsActive()}
      header={getConnectionName(keplrConnection.type)}
      onClick={() => tryActivation(keplrConnection.connector)}
    />
  )
}
