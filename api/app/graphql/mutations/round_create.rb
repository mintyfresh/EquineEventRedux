# frozen_string_literal: true

module Mutations
  class RoundCreate < BaseMutation
    description 'Creates a new Round'

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
    argument :input, Types::RoundCreateInputType, required: true

    def resolve(event_id:, input:)
      event = ::Event.find(event_id)
      round = event.rounds.build(number: (event.rounds.maximum(:number) || 0) + 1)

      input.matches.each do |match|
        round.matches.build(match.to_h)
      end

      if round.save
        { event:, round: }
      else
        { errors: round.errors }
      end
    end
  end
end
