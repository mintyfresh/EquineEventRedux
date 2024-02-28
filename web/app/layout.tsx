import 'bootstrap/dist/css/bootstrap.min.css'
import { Metadata } from 'next'
import { Container } from 'react-bootstrap'
import ApolloWrapper from './ApolloWrapper'
import AppNavbar from '../components/Layout/AppNavbar'

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
          <AppNavbar className="mb-3" />
          <Container>
            {children}
          </Container>
        </ApolloWrapper>
      </body>
    </html>
  )
}
