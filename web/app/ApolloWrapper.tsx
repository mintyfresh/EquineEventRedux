'use client'

import { ApolloLink, createHttpLink, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { ApolloNextAppProvider, NextSSRApolloClient, NextSSRInMemoryCache, SSRMultipartLink } from '@apollo/experimental-nextjs-app-support/ssr'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'
import result from '../lib/generated/graphql'
import React from 'react'

const isSSR = typeof window === 'undefined'

if (!isSSR) {
  window.ActionCable = require('@rails/actioncable')
}

const createActionCableLink = (url: string) => {
  if (isSSR) {
    return () => null // no web-sockets during SSR
  }

  return new ActionCableLink({
    cable: window.ActionCable.createConsumer(url)
  })
}

const createApolloClient = (actionCableUrl: string) => () => {
  const httpLink = createHttpLink({
    uri: isSSR ? process.env.GRAPHQL_API_URL : '/api/graphql'
  })

  let link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)

      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    createActionCableLink(actionCableUrl),
    httpLink
  )

  if (isSSR) {
    link = ApolloLink.from([
      new SSRMultipartLink({ stripDefer: true }),
      link
    ])
  }

  return new NextSSRApolloClient({
    link,
    cache: new NextSSRInMemoryCache({ possibleTypes: result.possibleTypes })
  })
}

export type ApolloWrapperProps = React.PropsWithChildren<{
  actionCableUrl: string
}>

export default function ApolloWrapper({ actionCableUrl, children }: ApolloWrapperProps) {
  return (
    <ApolloNextAppProvider makeClient={createApolloClient(actionCableUrl)}>
      {children}
    </ApolloNextAppProvider>
  )
}
