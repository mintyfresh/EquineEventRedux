import Link from 'next/link'
import { Container, Nav, Navbar } from 'react-bootstrap'
import ActiveLink from '../ActiveLink'

const showTimer = () => {
  window.open('/timer', 'Round Timer', 'menubar=no,toolbar=no,scrollbars=no,status=no,directories=no,location=no');
}

export type AppNavbarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>

const AppNavbar: React.FC<AppNavbarProps> = (props) => (
  <Navbar {...props} bg="dark" variant="dark" className="d-print-none">
    <Container>
      <Link href="/" passHref>
        <Navbar.Brand>Equine Event Redux</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="app-navbar-nav" />
      <Navbar.Collapse id="app-navbar-nav">
        <Nav className="mr-auto">
          <ActiveLink href="/events" passHref>
            <Nav.Link>Events</Nav.Link>
          </ActiveLink>
          <ActiveLink href="/timer-presets" passHref>
            <Nav.Link>Timer Presets</Nav.Link>
          </ActiveLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
)

export default AppNavbar
