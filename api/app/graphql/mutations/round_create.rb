# frozen_string_literal: true

module Mutations
  class RoundCreate < RecordCreate['Round']
    field :event, Types::EventType, null: true do
      description 'The Event that the Round was added to'
    end

    argument :event_id, ID, required: true do
      description 'The ID of the Event to add the Round to'
    end

    def resolve(event_id:, **arguments)
      event = ::Event.find(event_id)

      result = super(**arguments) do |round|
        round.event = event
      end

      { **result, event: }
    end
  end
end
