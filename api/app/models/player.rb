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
#  type                    :string           not null
#  data                    :jsonb            not null
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

  with_options class_name: 'PlayerMatch', dependent: false do
    has_many :player_matches, inverse_of: :player
    has_many :opponent_matches, foreign_key: :opponent_id, inverse_of: :opponent
  end

  has_many :matches, through: :player_matches
  has_many :opponents, -> { distinct }, through: :player_matches

  validates :name, length: { maximum: 50 }, presence: true
  validates :name, uniqueness: { scope: :event, condition: -> { non_deleted }, if: :name_changed? }

  strips_whitespace_from :name

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
    results = player_matches.complete.group(:result).count

    update!(
      completed_matches_count: results.values.sum,
      wins_count:              results.fetch('win', 0),
      draws_count:             results.fetch('draw', 0),
      losses_count:            results.fetch('loss', 0)
    )
  end

  # Calculates the player's score and maximum possible score.
  #
  # @return [void]
  def calculate_scores
    self.score = (wins_count * POINTS_PER_WIN) + (draws_count * POINTS_PER_DRAW) + (losses_count * POINTS_PER_LOSS)
    self.maximum_possible_score = completed_matches_count * POINTS_PER_WIN
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
