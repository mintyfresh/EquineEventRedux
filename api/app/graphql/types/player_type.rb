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

    field :wins_count, Integer, null: false
    field :draws_count, Integer, null: false
    field :losses_count, Integer, null: false
    field :score, Integer, null: false

    field :opponent_win_rate, Float, null: false

    # @!method wins_count
    #   @return [Integer]
    # @!method draws_count
    #   @return [Integer]
    # @!method losses_count
    #   @return [Integer]
    # @!method score
    #   @return [Integer]
    delegate :wins_count, :draws_count, :losses_count, :score, to: :score_card

    # @return [Float]
    def opponent_win_rate
      return 0.0 if total_matches_count.zero?

      total_opponents_score / total_matches_count
    end

  private

    # @return [Float]
    def total_opponents_score
      opponent_score_cards.sum { |score_card| score_card.score / score_card.maximum_possible_score.to_f }
    end

    # @return [Integer]
    def total_matches_count
      score_card.opponent_ids.count
    end

    # @return [Array<::PlayerScoreCard>]
    def opponent_score_cards
      @opponent_score_cards ||= dataloader
        .with(Sources::Record, ::PlayerScoreCard, :player_id)
        .load_all(score_card.opponent_ids)
    end

    # @return [::PlayerScoreCard]
    def score_card
      @score_card ||= dataloader.with(Sources::Record, ::PlayerScoreCard, :player_id).load(object.id)
    end
  end
end
