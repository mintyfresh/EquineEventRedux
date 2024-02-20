import { Errors } from '../../lib/errors'

export interface FormMultiControlErrorsProps {
  names: string[]
  errors: Errors
}

const FormMultiControlErrors: React.FC<FormMultiControlErrorsProps> = ({ names, errors }) => {
  const messages = errors.getBulk(names)

  if (!messages) {
    return null
  }

  return (
    <div className="text-danger">
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  )
}

export default FormMultiControlErrors
