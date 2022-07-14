# frozen_string_literal: true

module Resolvers
  class PlayerOpponentWinRate < BaseResolver
    type Float, null: false

    # @return [Float]
    def resolve
      return 0.0 if score_card.opponents_count.zero?

      opponent_score_cards.sum(&:score_ratio) / score_card.opponents_count
    end

  private

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
