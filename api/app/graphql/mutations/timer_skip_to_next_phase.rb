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

      TimerSchema.subscriptions.trigger(
        :timer, { event_id: event.id }, { event_type: TimerEvent::PHASE_CHANGE, timer: }
      )

      { result:, timer: }
    end
  end
end