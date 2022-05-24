# frozen_string_literal: true

module Mutations
  class PlayerCreate < RecordCreate['Player']
    field :event, Types::EventType, null: true do
      description 'The Event that the Player was added to'
    end

    argument :event_id, ID, required: true do
      description 'The ID of the Event to add the Player to'
    end

    def resolve(event_id:, **arguments)
      event = ::Event.find(event_id)

      result = super(**arguments) do |player|
        player.event = event
      end

      { **result, event: }
    end
  end
end
