import { Form } from 'react-bootstrap'
import { Errors } from '../../lib/errors'

export interface FormControlErrorsProps {
  name: string
  errors: Errors
}

const FormControlErrors: React.FC<FormControlErrorsProps> = ({ name, errors }) => {
  if (!errors || !errors.any(name)) {
    return null
  }

  return (
    <Form.Control.Feedback type="invalid">
      {errors.get(name).map((error) => (
        <div key={error}>{error}</div>
      ))}
    </Form.Control.Feedback>
  )
}

export default FormControlErrors
