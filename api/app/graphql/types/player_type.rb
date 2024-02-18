# frozen_string_literal: true

module Types
  class PlayerType < BaseObject
    field :id, ID, null: false
    field :event_id, ID, null: false
    field :name, String, null: false
    field :paid, Boolean, null: false
    field :dropped, Boolean, null: false
    field :deleted, Boolean, null: false
    field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true

    field :completed_matches_count, Integer, null: false
    field :wins_count, Integer, null: false
    field :draws_count, Integer, null: false
    field :losses_count, Integer, null: false
    field :score, Integer, null: false
    field :maximum_possible_score, Integer, null: false

    field :opponent_ids, [ID], null: false
    field :opponent_win_rate, Float, null: false

    # @return [Array<String>]
    def opponent_ids
      score_card.opponent_ids || []
    end

    # @return [Numeric]
    def opponent_win_rate
      score_card.opponent_win_rate || 0.0
    end

    # @return [::PlayerScoreCard]
    def score_card
      @score_card ||= dataloader.with(Sources::Record, ::PlayerScoreCard, :player_id).load(object.id)
    end
  end
end
