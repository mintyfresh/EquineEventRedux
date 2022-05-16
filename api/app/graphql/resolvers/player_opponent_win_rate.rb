# frozen_string_literal: true

module Resolvers
  class PlayerOpponentWinRate < BaseResolver
    type Float, null: false

    # @return [Float]
    def resolve
      return 0.0 if total_opponents_count.zero?

      total_opponents_score / total_opponents_count
    end

  private

    # @return [Float]
    def total_opponents_score
      opponent_score_cards.sum { |score_card| score_card.score / score_card.maximum_possible_score.to_f }
    end

    # @return [Integer]
    def total_opponents_count
      score_card.opponents_count
    end

    # @return [Array<::PlayerScoreCard>]
    def opponent_score_cards
      @opponent_score_cards ||= dataloader
        .with(Sources::Record, ::PlayerScoreCard, :player_id)
        .load_all(score_card.opponent_ids.compact)
    end

    # @return [::PlayerScoreCard]
    def score_card
      @score_card ||= dataloader.with(Sources::Record, ::PlayerScoreCard, :player_id).load(object.id)
    end
  end
end
