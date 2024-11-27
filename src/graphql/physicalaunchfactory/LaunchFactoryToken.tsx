import { gql } from '@apollo/client'

export const LAUNCHPAD_TOKEN_QUERY = gql`
    query LaunchpadToken($id: String!) {
        token(id: $id) {
            id
            name
            symbol
            dev
            ipfsHash
            initialSupply
            migrationCap
            plqAmount
            startTime
            tokenAmount
            migrated
            txCount
            buys(orderDirection: asc, orderBy: timestamp) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                buyer
            }
            sells(orderDirection: asc, orderBy: timestamp) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                seller
            }
        }
    }
`

export const LAUNCHPAD_TOKEN_PRICE_QUERY = gql`
    query LaunchpadToken($id: String!, $duration: Int!) {
        token(id: $id) {
            id
            name
            symbol
            dev
            ipfsHash
            initialSupply
            migrationCap
            plqAmount
            startTime
            tokenAmount
            migrated
            txCount
            buys(orderDirection: asc, orderBy: timestamp, where: { timestamp_gt: $duration }) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                buyer
            }
            sells(orderDirection: asc, orderBy: timestamp, where: { timestamp_gt: $duration }) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                seller
            }
        }
    }
`

export type LaunchpadTokenQuery = {
  __typename?: 'Query'
  token?: {
    __typename?: 'Token'
    id: string
    name?: string
    symbol?: string
    dev?: string
    ipfsHash?: string
    initialSupply?: string
    migrationCap?: string
    plqAmount?: string
    startTime?: string
    tokenAmount?: string
    txCount?: string
    migrated?: boolean
    buys?: Array<{
      __typename?: 'TokenMarket'
      id: string
      plqAmount?: string
      price?: string
      tokenAmount?: string
      buyer?: string
      timestamp: number
    }>
    sells?: Array<{
      __typename?: 'TokenMarket'
      id: string
      plqAmount?: string
      price?: string
      tokenAmount?: string
      seller?: string
      timestamp: number
    }>
  }
}
