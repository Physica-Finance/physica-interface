import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from '@apollo/client'

import store, { AppState } from '../../state/index'

const httpLink = new HttpLink({ uri: 'https://subgraph.planq.finance/subgraphs/name/vbstreetz/witswap-staking' })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = (store.getState() as AppState).application.chainId

  operation.setContext(() => ({
    uri: chainId,
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})
