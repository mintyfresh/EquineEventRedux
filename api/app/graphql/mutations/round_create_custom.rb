# frozen_string_literal: true

module Mutations
  class RoundCreateCustom < RecordCreate['Round', input_type: Types::RoundCreateCustomInputType]
    def resolve(input:)
      event = input.event

      validate_current_round_complete(event)
      return { errors: event.errors } if event.errors.any?

      super(input:)
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
