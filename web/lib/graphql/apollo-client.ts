import { ApolloClient, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import result from '../generated/graphql'

export const { getClient } = registerApolloClient(() => (
  new ApolloClient({
    cache: new InMemoryCache({ possibleTypes: result.possibleTypes }),
    link: createUploadLink({ uri: process.env.GRAPHQL_API_URL })
  })
))
