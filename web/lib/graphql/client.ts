import { ApolloClient, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import ActionCableLink from "graphql-ruby-client/subscriptions/ActionCableLink"
import { useMemo } from 'react'
import result from '../generated/graphql'

const isSSR = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null

if (!isSSR) {
  window.ActionCable = require('@rails/actioncable')
}

const createHttpLink = () => {
  const httpUri = isSSR ? process.env.API_URL : '/api/graphql'

  return createUploadLink({
    uri: httpUri
  })
}

const createWSLink = () => {
  if (isSSR) {
    return () => null // no web-sockets during SSR
  }

  return new ActionCableLink({
    cable: window.ActionCable.createConsumer(process.env.NEXT_PUBLIC_CABLE_URL)
  })
}

export const createApolloClient = () => {
  const httpLink = createHttpLink()

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)

      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    createWSLink(),
    httpLink
  )

  return new ApolloClient({
    ssrMode: isSSR,
    link,
    cache: new InMemoryCache({ possibleTypes: result.possibleTypes })
  })
}

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
