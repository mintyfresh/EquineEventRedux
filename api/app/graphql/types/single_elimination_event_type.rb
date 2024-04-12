# frozen_string_literal: true

module Types
  class SingleEliminationEventType < BaseObject
    implements Types::EventType

    field :pairing_mode, Types::SingleEliminationPairingModeType, null: false

    field :maximum_number_of_rounds, Integer, null: false do
      description 'Calculates the maximum number of rounds for the event.'
    end
    field :number_of_players_in_round, Integer, null: false do
      description 'Calculates the number of players in a given round.'

      argument :round_number, Integer, required: true do
        description 'The round number for which to calculate the number of players. ' \
                    'This must be a positive integer. (ie. the first round is 1)'
      end
    end

    # @return [Integer]
    def maximum_number_of_rounds
      # preload the players association to avoid COUNT queries
      players && object.maximum_number_of_rounds
    end

    # @param round_number [Integer]
    # @return [Integer]
    def number_of_players_in_round(round_number:)
      # preload the players association to avoid COUNT queries
      players && object.number_of_players_in_round(round_number)
    rescue ArgumentError => error
      # handle non-positive round numbers
      raise GraphQL::ExecutionError, error.message
    end
  end
end
