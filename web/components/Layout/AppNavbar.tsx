'use client'

import Link from 'next/link'
import { Container, Nav, Navbar } from 'react-bootstrap'
import ActiveLink from '../ActiveLink'

export type AppNavbarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>

const AppNavbar: React.FC<AppNavbarProps> = (props) => (
  <Navbar {...props} bg="dark" variant="dark" className="d-print-none">
    <Container>
      <Link href="/" passHref legacyBehavior>
        <Navbar.Brand>Equine Event Redux</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="app-navbar-nav" />
      <Navbar.Collapse id="app-navbar-nav">
        <Nav className="mr-auto">
          <ActiveLink href="/events" passHref legacyBehavior>
            <Nav.Link>Events</Nav.Link>
          </ActiveLink>
          <ActiveLink href="/timer-presets" passHref legacyBehavior>
            <Nav.Link>Timer Presets</Nav.Link>
          </ActiveLink>
          <ActiveLink href="/audio-clips" passHref legacyBehavior>
            <Nav.Link>Audio Clips</Nav.Link>
          </ActiveLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
)

export default AppNavbar
