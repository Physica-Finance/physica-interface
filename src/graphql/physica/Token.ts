import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import gql from 'graphql-tag'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

import { CHAIN_NAME_TO_CHAIN_ID } from '../data/util'
/*
The difference between Token and TokenProject:
  Token: an on-chain entity referring to a contract (e.g. uni token on ethereum 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984)
  TokenProject: an off-chain, aggregated entity that consists of a token and its bridged tokens (e.g. uni token on all chains)
  TokenMarket and TokenProjectMarket then are market data entities for the above.
    TokenMarket is per-chain market data for contracts pulled from the graph.
    TokenProjectMarket is aggregated market data (aggregated over multiple dexes and centralized exchanges) that we get from coingecko.
*/

export const TOKEN_QUERY = gql`
  query Token2($id: String!) {
    token(id: $id) {
      id
      name
      symbol
      volumeUSD
      totalValueLockedUSD
      totalSupply
      tokenDayData(first: 100, orderDirection: desc, orderBy: date) {
        priceUSD
        date
        id
      }
      decimals
    }
  }
`
export type TokenQuery2 = {
  __typename?: 'Query'
  token?: {
    __typename?: 'Token'
    id: string
    decimals?: number
    name?: string
    symbol?: string
    volumeUSD?: string
    totalValueLockedUSD?: string
    totalSupply?: string
    tokenDayData?: { __typename?: 'TokenMarket'; id: string; priceUSD?: string; date: number }
  }
}

export type TokenQueryData2 = TokenQuery2['token']

// TODO: Return a QueryToken from useTokenQuery instead of TokenQueryData to make it more usable in Currency-centric interfaces.
export class QueryToken extends WrappedTokenInfo {
  constructor(address: string, data: NonNullable<TokenQueryData2>, logoSrc?: string) {
    super({
      chainId: 7070,
      address,
      decimals: data.decimals ?? DEFAULT_ERC20_DECIMALS,
      symbol: data.symbol ?? '',
      name: data.name ?? '',
      logoURI: logoSrc ?? undefined,
    })
  }
}
