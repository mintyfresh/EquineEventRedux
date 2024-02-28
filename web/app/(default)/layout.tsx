import { Container } from 'react-bootstrap'
import AppNavbar from '../../components/Layout/AppNavbar'

export default function DefaultLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppNavbar className="mb-3" />
      <Container>
        {children}
      </Container>
    </>
  )
}