import Head from 'next/head'
import React from 'react'
import { Container } from 'react-bootstrap'
import AppNavbar from './Layout/AppNavbar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Equine Event Redux</title>
      </Head>
      <AppNavbar className="mb-3" />
      <Container>
        {children}
      </Container>
    </>
  )
}

export default Layout
