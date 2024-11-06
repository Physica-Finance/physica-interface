import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import gql from 'graphql-tag'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

import { CHAIN_NAME_TO_CHAIN_ID } from './util'

/*
The difference between Token and TokenProject:
  Token: an on-chain entity referring to a contract (e.g. uni token on ethereum 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984)
  TokenProject: an off-chain, aggregated entity that consists of a token and its bridged tokens (e.g. uni token on all chains)
  TokenMarket and TokenProjectMarket then are market data entities for the above.
    TokenMarket is per-chain market data for contracts pulled from the graph.
    TokenProjectMarket is aggregated market data (aggregated over multiple dexes and centralized exchanges) that we get from coingecko.
*/
gql`
  query Token($chain: Chain!, $address: String = null) {
    token(chain: $chain, address: $address) {
      id
      decimals
      name
      chain
      address
      symbol
      standard
      market(currency: USD) {
        id
        totalValueLocked {
          id
          value
          currency
        }
        price {
          id
          value
          currency
        }
        volume24H: volume(duration: DAY) {
          id
          value
          currency
        }
        priceHigh52W: priceHighLow(duration: YEAR, highLow: HIGH) {
          id
          value
        }
        priceLow52W: priceHighLow(duration: YEAR, highLow: LOW) {
          id
          value
        }
      }
      project {
        id
        description
        homepageUrl
        twitterName
        logoUrl
        tokens {
          id
          chain
          address
        }
      }
    }
  }
`

const TOKEN_QUERY = gql`
  query Token($id: String!) {
    token(id: $id) {
      id
      name
      symbol
      volumeUSD
      totalValueLockedUSD
      totalSupply
      tokenDayData(first: 1, orderDirection: desc, orderBy: date) {
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

export type { Chain, TokenQuery } from './__generated__/types-and-hooks'

export type TokenQueryData = TokenQuery2['token']

// TODO: Return a QueryToken from useTokenQuery instead of TokenQueryData to make it more usable in Currency-centric interfaces.
export class QueryToken extends WrappedTokenInfo {
  constructor(address: string, data: NonNullable<TokenQueryData>, logoSrc?: string) {
    super({
      chainId: CHAIN_NAME_TO_CHAIN_ID[7070],
      address,
      decimals: data.decimals ?? DEFAULT_ERC20_DECIMALS,
      symbol: data.symbol ?? '',
      name: data.name ?? '',
      logoURI: logoSrc ?? undefined,
    })
  }
}
