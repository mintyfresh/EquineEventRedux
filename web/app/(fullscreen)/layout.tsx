import { Container } from 'react-bootstrap'

export default function FullscreenLayout({ children }: React.PropsWithChildren) {
  return (
    <Container fluid style={{ 'minHeight': '100vh' }} className="d-flex flex-column justify-content-center">
      {children}
    </Container>
  )
}
