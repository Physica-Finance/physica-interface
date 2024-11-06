import { useLazyQuery, useQuery } from '@apollo/client'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import gql from 'graphql-tag'
import { useMemo } from 'react'
import { apolloClient } from './apollo'

import { Chain, Currency, SafetyLevel, SearchTokensQuery, TokenStandard } from '../data/__generated__/types-and-hooks'
import { chainIdToBackendName } from '../data/util'

gql`
  query SearchTokens($searchQuery: String!) {
    searchTokens(searchQuery: $searchQuery) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      market(currency: USD) {
        id
        price {
          id
          value
          currency
        }
        pricePercentChange(duration: DAY) {
          id
          value
        }
        volume24H: volume(duration: DAY) {
          id
          value
          currency
        }
      }
      project {
        id
        logoUrl
        safetyLevel
      }
    }
  }
`

const SEARCH_TOKEN_QUERY = gql`
  query SearchTokens($searchQuery: String!) {
    tokens(where: {or: [{name_contains_nocase: $searchQuery}, {symbol_contains_nocase: $searchQuery}, {id: $searchQuery}]}) {
      id
      decimals
      name
      symbol
      tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
        priceUSD
        volumeUSD
        id
        open
      }
    }
  }
`

export type SearchToken = NonNullable<NonNullable<SearchTokensQuery2['tokens']>[number]>
export type SearchTokensQuery2 = {
  __typename?: 'Query',
  tokens?: Array<
    { __typename?: 'Token',
      id: string,
      decimals?: number,
      name?: string,
      symbol?: string,
      tokenDayData?: { __typename?: 'TokenMarket', id?: string, priceUSD?: string, volumeUSD?: string, open?: string }, }> };

export function useSearchTokens(
  searchQuery: string,
  chainId: number
): { data: SearchToken[]; loading: boolean; error?: Error } {
  const { data, loading, error } = useQuery(SEARCH_TOKEN_QUERY, { variables: {
    searchQuery,
  },client: apolloClient,})



  const sortedTokens = useMemo(() => {
    return data?.tokens
  }, [data, chainId])

  return {
    data: sortedTokens,
    loading,
    error,
  }
}
