# frozen_string_literal: true

module Types
  class PairingInputType < BaseInputObject
    argument :player1_id, ID, required: true
    argument :player2_id, ID, required: :nullable

    # @return [Array<Array<String, nil>>]
    def prepare
      [player1_id, player2_id]
    end
  end
end
