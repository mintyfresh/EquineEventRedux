# frozen_string_literal: true

module Mutations
  class TimerCreate < RecordCreate['Timer']
    field :event, Types::EventType, null: true do
      description 'The Event to which the Timer was added'
    end

    argument :event_id, ID, required: true do
      description 'The ID of the Event to add the Timer to'
    end

    def resolve(event_id:, **)
      event = ::Event.find(event_id)

      result = super(**) do |timer|
        timer.event = event
      end

      { **result, event: }
    end
  end
end
