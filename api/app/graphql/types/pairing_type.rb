# frozen_string_literal: true

module Types
  class PairingType < BaseObject
    field :player1, Types::PlayerType, null: false
    field :player2, Types::PlayerType, null: true
  end
end
