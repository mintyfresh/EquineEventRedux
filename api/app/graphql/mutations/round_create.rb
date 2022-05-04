# frozen_string_literal: true

module Mutations
  class RoundCreate < BaseMutation
    description 'Create a new Round'

    field :event, Types::EventType, null: true do
      description 'The Event that the Round was added to'
    end
    field :round, Types::RoundType, null: true do
      description 'The Round that was created'
    end
    field :errors, [Types::ErrorType], null: true

    argument :event_id, ID, required: true do
      description 'The ID of the Event to add the Round to'
    end

    def resolve(event_id:)
      event = ::Event.find(event_id)
      round = event.rounds.build(number: event.rounds.count + 1)

      if round.save
        { event:, round: }
      else
        { errors: round.errors }
      end
    end
  end
end
