# frozen_string_literal: true

module Mutations
  class TimerSkipToNextPhase < BaseMutation
    argument :id, ID, required: true

    field :result, Boolean, null: true
    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:)
      timer  = ::Timer.find(id)
      result = timer.skip_to_next_phase!

      EquineEventApiSchema.subscriptions.trigger(
        :timer_event, { event_id: timer.event_id }, { event_type: TimerEvent::SKIP_TO_NEXT_PHASE, timer: }
      )

      { result:, timer: }
    end
  end
end
