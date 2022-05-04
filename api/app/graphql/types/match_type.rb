# frozen_string_literal: true

module Types
  class MatchType < Types::BaseObject
    field :id, ID, null: false
    field :round_id, ID, null: false
    field :player1_id, ID, null: false
    field :player2_id, ID, null: true
    field :winner_id, ID
    field :draw, Boolean, null: false

    field :player1, Types::PlayerType, null: false
    field :player2, Types::PlayerType, null: true

    # @return [::Player]
    def player1
      dataloader.with(Sources::Record, ::Player).load(object.player1_id)
    end

    # @return [::Player, nil]
    def player2
      dataloader.with(Sources::Record, ::Player).load(object.player2_id) if object.player2_id
    end
  end
end
