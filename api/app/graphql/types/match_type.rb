# frozen_string_literal: true

module Types
  class MatchType < Types::BaseObject
    field :id, ID, null: false
    field :round_id, ID, null: false
    field :player1_id, ID, null: false
    field :player2_id, ID, null: true
    field :winner_id, ID
    field :table, Integer, null: false
    field :draw, Boolean, null: false
    field :draw_permitted, Boolean, null: false, resolver_method: :draw_permitted?

    field :player1, Types::PlayerType, null: false
    field :player2, Types::PlayerType, null: true

    field :round, Types::RoundType, null: false
    field :timer, Types::TimerType, null: true

    # @return [Boolean]
    def draw_permitted?
      dataloader.with(Sources::Association, ::Match, :event).load(object).draws_permitted?
    end

    # @return [::Player]
    def player1
      dataloader.with(Sources::Record, ::Player).load(object.player1_id)
    end

    # @return [::Player, nil]
    def player2
      dataloader.with(Sources::Record, ::Player).load(object.player2_id) if object.player2_id
    end

    # @return [::Round]
    def round
      dataloader.with(Sources::Record, ::Round).load(object.round_id)
    end

    # @return [::Timer, nil]
    def timer
      dataloader.with(Sources::Record, ::Timer, :match_id).load(object.id)
    end
  end
end
