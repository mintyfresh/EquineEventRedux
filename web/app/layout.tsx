import 'bootstrap/dist/css/bootstrap.min.css'
import { Metadata } from 'next'
import ApolloWrapper from './ApolloWrapper'

export const metadata: Metadata = {
  title: 'Home - Equine Event Redux',
  description: 'Tournament management for MLP:CCG'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper actionCableUrl={process.env.ACTION_CABLE_URL!}>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  )
}
