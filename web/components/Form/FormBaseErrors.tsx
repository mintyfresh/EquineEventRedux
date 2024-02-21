import { Alert } from 'react-bootstrap'
import { Errors } from '../../lib/errors'

export interface FormBaseErrorsProps {
  errors: Errors
}

const FormBaseErrors: React.FC<FormBaseErrorsProps> = ({ errors }) => {
  const messages = errors.get('base')

  if (messages.length === 0) {
    return null
  }

  return (
    <Alert variant="danger">
      {messages.map((message, index) => (
        <p key={index} className="mb-0">{message}</p>
      ))}
    </Alert>
  )
}

export default FormBaseErrors
