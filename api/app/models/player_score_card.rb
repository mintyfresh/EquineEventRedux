# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id     :uuid
#  matches_count :bigint
#  wins_count    :bigint
#  losses_count  :bigint
#  draws_count   :bigint
#
class PlayerScoreCard < ApplicationRecord
  POINTS_PER_WIN  = 3
  POINTS_PER_DRAW = 1
  POINTS_PER_LOSS = 0

  belongs_to :player

  # @return [Integer]
  def score
    (wins_count * POINTS_PER_WIN) + (draws_count * POINTS_PER_DRAW) + (losses_count * POINTS_PER_LOSS)
  end
end
