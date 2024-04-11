import { Button } from 'react-bootstrap'
import { useCreateRoundMutation } from '../../lib/generated/graphql'

export interface CreateRoundButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  event: { id: string }
  onCreate?(): void
}

export default function CreateRoundButton({ event, onCreate, ...props }: CreateRoundButtonProps) {
  const [createRound, { loading }] = useCreateRoundMutation({
    variables: { input: { eventId: event.id } },
    onCompleted: ({ roundCreate }) => {
      roundCreate?.round?.id && onCreate?.()
    }
  })

  return (
    <Button {...props} disabled={loading || props.disabled} onClick={() => createRound()}>
      Create new round
    </Button>
  )
}
