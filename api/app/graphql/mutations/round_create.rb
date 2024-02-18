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

      # Prevent the creation of additional rounds until the current round is complete
      if (current_round = event.current_round).present? && !current_round.complete?
        event.errors.add(:base, 'Cannot add a new round until the current round is complete')
        return { event:, errors: event.errors }
      end

      result = super(**arguments) do |round|
        round.event = event
      end

      { **result, event: }
    end
  end
end
