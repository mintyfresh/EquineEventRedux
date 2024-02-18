# frozen_string_literal: true

module Mutations
  class TimerReset < BaseMutation
    description 'Reset a timer to its initial state'

    argument :id, ID, required: true
    argument :paused, Boolean, required: false, default_value: false do
      description 'Whether to pause the timer after resetting it'
    end

    field :result, Boolean, null: true
    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:, paused: false)
      timer  = ::Timer.find(id)
      result = timer.reset!(paused:)

      TimerSchema.subscriptions.trigger(
        :timer, { event_id: timer.event_id }, { event_type: TimerEvent::RESET, timer: }
      )

      { result:, timer: }
    end
  end
end
