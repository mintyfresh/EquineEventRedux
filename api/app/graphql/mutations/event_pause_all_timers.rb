# frozen_string_literal: true

module Mutations
  class EventPauseAllTimers < BaseMutation
    argument :event_id, ID, required: true do
      description 'The ID of the event for which the timers should be paused.'
    end

    field :event, Types::EventType, null: true do
      description 'The event for which the timers were paused.'
    end
    field :timers, [Types::TimerType], null: true do
      description 'The timers that were paused.'
    end
    field :errors, [Types::ErrorType], null: true

    def resolve(event_id:)
      event = ::Event.find(event_id)
      timers = event.timers.active.lock

      event.transaction do
        time = Time.current

        timers.preload(:preset).find_each do |timer|
          timer.pause!(time)
        end
      end

      { event:, timers: }
    end
  end
end
