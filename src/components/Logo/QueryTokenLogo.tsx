import { NATIVE_CHAIN_ID, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { TokenStandard } from 'graphql/data/__generated__/types-and-hooks'
import { SearchToken } from 'graphql/physica/SearchTokens'
import { TokenQueryData2 } from 'graphql/physica/Token'
import { TopToken } from 'graphql/physica/TopTokens'
import { CHAIN_NAME_TO_CHAIN_ID } from 'graphql/data/util'

import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function QueryTokenLogo(
  props: AssetLogoBaseProps & {
    token?: TopToken | TokenQueryData2 | SearchToken
  }
) {
  const chainId = 7070

  return (
    <AssetLogo
      isNative={props.token?.id == WRAPPED_NATIVE_CURRENCY[chainId]?.address}
      chainId={chainId}
      address={props.token?.id}
      symbol={props.token?.symbol}
      backupImg={''}
      {...props}
    />
  )
}
