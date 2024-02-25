import { ApolloProvider } from '@apollo/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { useApolloClient } from '../lib/graphql/client'
import { NextPageWithLayout } from '../lib/types/next-page'

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const apolloClient = useApolloClient(pageProps.initialApolloState)

  const getLayout = Component.getLayout ?? ((page) => (
    <Layout>{page}</Layout>
  ))

  return (
    <ApolloProvider client={apolloClient}>
      {getLayout(<Component {...pageProps} />)}
    </ApolloProvider>
  )
}

export default MyApp
