import gql from 'graphql-tag'
import { Chain } from './__generated__/types-and-hooks'

gql`
  query TokenPrice($chain: Chain!, $address: String = null, $duration: HistoryDuration!) {
    token(chain: $chain, address: $address) {
      id
      address
      chain
      market(currency: USD) {
        id
        price {
          id
          value
        }
        priceHistory(duration: $duration) {
          id
          timestamp
          value
        }
      }
    }
  }
`

export const TOKEN_PRICE_QUERY = gql`
query TokenPrice($id: String!) {
  token(id: $id) {
    id
    tokenDayData(first: 100, orderDirection: desc, orderBy: date) {
      priceUSD
      date
      id
    }
  }
}
`

export type { TokenPriceQuery } from './__generated__/types-and-hooks'

export type TokenPriceQuery2 = {
  __typename?: 'Query',
  token?: {
    __typename?: 'Token',
    id: string,
    tokenDayData?: Array<{ __typename?: 'TokenMarket',
      id?: string,
      priceUSD?: string,
      date?: number
    }>
  }
};
