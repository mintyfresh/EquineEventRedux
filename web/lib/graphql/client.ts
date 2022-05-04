import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { useMemo } from 'react'
import result from '../generated/graphql'

const isSSR = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null

export const createApolloClient = () => (
  new ApolloClient({
    ssrMode: isSSR,
    uri: process.env.API_URL || '/api/graphql',
    cache: new InMemoryCache({ possibleTypes: result.possibleTypes })
  })
)

export const initializeApolloClient = (initialState: any = null) => {
  const _client = apolloClient ?? createApolloClient()

  if (initialState) {
    const existingState = _client.cache.extract()

    _client.cache.restore({ ...existingState, ...initialState })
  }

  if (!isSSR) {
    apolloClient ?? (apolloClient = _client)
  }

  return _client
}

export const useApolloClient = (initialState: any = null) => (
  useMemo(() => initializeApolloClient(initialState), [initialState])
)
