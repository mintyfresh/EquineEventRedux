# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id                      :uuid             not null, primary key
#  event_id                :uuid             not null
#  name                    :citext           not null
#  paid                    :boolean          default(FALSE), not null
#  dropped                 :boolean          default(FALSE), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  deleted_at              :datetime
#  completed_matches_count :integer          default(0), not null
#  wins_count              :integer          default(0), not null
#  draws_count             :integer          default(0), not null
#  losses_count            :integer          default(0), not null
#  score                   :integer          default(0), not null
#  maximum_possible_score  :integer          default(0), not null
#
# Indexes
#
#  index_players_on_event_id           (event_id)
#  index_players_on_event_id_and_name  (event_id,name) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class Player < ApplicationRecord
  include SoftDeletable

  # The names of attributes that are used to calculate a player's score or relative ranking.
  #
  # @type [Array<String>]
  PLAYER_STATISTICS_ATTRIBUTES = %w[completed_matches_count wins_count draws_count losses_count].freeze

  # The number of points added to a player's score for a win.
  #
  # @type [Integer]
  POINTS_PER_WIN  = 3
  # The number of points added to a player's score for a draw.
  #
  # @type [Integer]
  POINTS_PER_DRAW = 1
  # The number of points added to a player's score for a loss.
  #
  # @type [Integer]
  POINTS_PER_LOSS = 0

  belongs_to :event, inverse_of: :players

  has_one :score_card, class_name: 'PlayerScoreCard', dependent: false, inverse_of: :player

  validates :name, length: { maximum: 50 }, presence: true
  validates :name, uniqueness: { scope: :event, condition: -> { non_deleted }, if: :name_changed? }

  before_save :calculate_scores, if: :player_statistics_changed?

  # @!method self.active
  #   @return [Class<Player>]
  scope :active, -> { non_deleted.where(paid: true, dropped: false) }

  # @!method self.order_by_score(direction = :desc)
  #   @param direction [:asc, :desc]
  #   @return [Class<Player>]
  scope :order_by_score, lambda { |direction = :desc|
    joins(:score_card).order(score: direction, 'player_score_cards.opponent_win_rate' => direction)
  }

  # @return [Boolean]
  def active?
    !deleted? && paid? && !dropped?
  end

  # Calculates the player's statistics.
  #
  # @return [void]
  def calculate_statistics!
    update!(
      completed_matches_count: matches.complete.count,
      wins_count:              matches.where_winner(self).count,
      draws_count:             matches.draw.count,
      losses_count:            matches.where_loser(self).count
    )
  end

  # Calculates the player's score and maximum possible score.
  #
  # @return [void]
  def calculate_scores
    self.score = (wins_count * POINTS_PER_WIN) + (draws_count * POINTS_PER_DRAW) + (losses_count * POINTS_PER_LOSS)
    self.maximum_possible_score = completed_matches_count * POINTS_PER_WIN
  end

  # Returns the matches this player has been matched with.
  # Excludes matches from soft-deleted rounds.
  #
  # @return [Class<Match>]
  def matches
    Match
      .joins(:round)
      .merge(Round.non_deleted)
      .with_player(self)
  end

  # Returns a list of IDs of opponents this player has been matched with.
  #
  # @param scope [ActiveRecord::Relation<Match>, nil] an optional scope to apply to the matches considered
  # @return [Array<String>]
  def opponent_ids(scope: nil)
    matches = self.matches
    matches = matches.merge(scope) if scope

    matches.distinct.pluck(
      Match.arel_table[:player1_id]
        .when(Player.bind_param('player1_id', id))
        .then(Match.arel_table[:player2_id])
        .else(Match.arel_table[:player1_id])
    )
  end

  # @!method opponent_win_rate
  #   @return [Numeric]
  delegate :opponent_win_rate, to: :score_card

  # Returns the number of times this player has been matched with the specified player.
  #
  # @param player [Player, nil]
  # @return [Integer]
  def times_matched_with(player)
    matches.with_player(player).count
  end

  # Determines if the player's statistics have changed.
  #
  # @return [Boolean]
  def player_statistics_changed?
    PLAYER_STATISTICS_ATTRIBUTES.any? { |attribute| attribute_changed?(attribute) }
  end
end
