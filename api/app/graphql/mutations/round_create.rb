# frozen_string_literal: true

module Mutations
  class RoundCreate < RecordCreate['Round']
    def resolve(input:)
      event = input.event

      validate_current_round_complete(event)
      return { errors: event.errors } if event.errors.any?

      Round.transaction do
        super(input:).tap do |result|
          round    = result[:round]
          pairings = event.generate_pairings(round.number)
          round.create_matches_from_pairings!(pairings)
        end
      end
    end

  private

    # @param event [::Event]
    # @return [void]
    def validate_current_round_complete(event)
      # Prevent the creation of additional rounds until the current round is complete
      return if (current_round = event.current_round).nil? || current_round.complete?

      event.errors.add(:base, 'Cannot add a new round until the current round is complete')
    end
  end
end
