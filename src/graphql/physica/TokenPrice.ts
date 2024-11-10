import gql from 'graphql-tag'

export const TOKEN_PRICE_QUERY = gql`
  query TokenPrice2($id: String!) {
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

export type TokenPriceQuery2 = {
  __typename?: 'Query'
  token?: {
    __typename?: 'Token'
    id: string
    tokenDayData?: Array<{ __typename?: 'TokenMarket'; id?: string; priceUSD?: string; date?: number }>
  }
}
