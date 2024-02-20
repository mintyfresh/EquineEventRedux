# frozen_string_literal: true

module Mutations
  class EventUnpauseAllTimers < BaseMutation
    argument :event_id, ID, required: true do
      description 'The ID of the event for which the timers should be unpaused.'
    end

    field :event, Types::EventType, null: true do
      description 'The event for which the timers were unpaused.'
    end
    field :timers, [Types::TimerType], null: true do
      description 'The timers that were unpaused.'
    end
    field :errors, [Types::ErrorType], null: true

    def resolve(event_id:)
      event = ::Event.find(event_id)
      timers = event.timers.paused

      timers.each(&:unpause!)

      { event:, timers: }
    end
  end
end
