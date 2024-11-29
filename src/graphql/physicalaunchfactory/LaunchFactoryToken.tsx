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
            txs(orderDirection: asc, orderBy: timestamp) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                from
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
            txs(orderDirection: asc, orderBy: timestamp, where: { timestamp_gt: $duration, price_gt: 0 }) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                from
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
    txs?: Array<{
      __typename?: 'TokenMarket'
      id: string
      plqAmount?: string
      price?: string
      tokenAmount?: string
      from?: string
      buy?: boolean
      timestamp: number
    }>
  }
}
