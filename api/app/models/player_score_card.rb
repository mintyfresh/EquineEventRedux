# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id               :uuid
#  matches_count           :bigint
#  completed_matches_count :bigint
#  wins_count              :bigint
#  losses_count            :bigint
#  draws_count             :bigint
#  opponent_ids            :uuid             is an Array
#
class PlayerScoreCard < ApplicationRecord
  POINTS_PER_WIN  = 3
  POINTS_PER_DRAW = 1
  POINTS_PER_LOSS = 0

  self.implicit_order_column = :player_id

  belongs_to :player

  scope :order_by_score, -> (direction = 'ASC') { order(Arel.sql(<<-SQL.squish) => direction) }
    ("player_score_cards"."wins_count" * #{POINTS_PER_WIN})
    + ("player_score_cards"."draws_count" * #{POINTS_PER_DRAW})
    + ("player_score_cards"."losses_count" * #{POINTS_PER_LOSS})
  SQL

  # @return [Integer]
  def score
    (wins_count * POINTS_PER_WIN) + (draws_count * POINTS_PER_DRAW) + (losses_count * POINTS_PER_LOSS)
  end

  # The maximum possible score the player could have if they'd won every match.
  #
  # @return [Integer]
  def maximum_possible_score
    completed_matches_count * POINTS_PER_WIN
  end

  # The ratio of the player's score to the maximum possible score.
  #
  # @return [Float]
  def score_ratio
    return 0.0 if maximum_possible_score.zero?

    score / maximum_possible_score.to_f
  end

  # @return [ActiveRecord::Relation<Player>]
  def opponents
    Player.where_any(:id, opponent_ids.compact)
  end

  # @return [ActiveRecord::Relation<PlayerScoreCard>]
  def opponent_score_cards
    PlayerScoreCard.joins(:player).merge(opponents)
  end

  # @return [Integer]
  def opponents_count
    opponent_ids.count(&:present?) # Exclude the nil opponent ID
  end

  # @return [Float]
  def opponent_win_rate
    return 0.0 if opponents_count.zero?

    opponent_score_cards.sum(&:score_ratio) / opponents_count
  end

  # @return [Boolean]
  def readonly?
    true # Table is a database view
  end
end
