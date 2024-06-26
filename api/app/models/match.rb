# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player1_id :uuid             not null
#  player2_id :uuid
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  table      :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#  deleted_in :uuid
#  complete   :boolean          default(FALSE), not null
#
# Indexes
#
#  index_matches_on_player1_id          (player1_id)
#  index_matches_on_player2_id          (player2_id)
#  index_matches_on_round_id            (round_id)
#  index_matches_on_round_id_and_table  (round_id,table) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (player1_id => players.id)
#  fk_rails_...  (player2_id => players.id)
#  fk_rails_...  (round_id => rounds.id)
#
class Match < ApplicationRecord
  include SoftDeletable

  attr_readonly :round_id

  # Ensure a deterministic order of player IDs.
  # Also ensure that the first player ID is always one that is present.
  PLAYER_IDS_COMPARATOR = -> (id) { id ? id.tr('-', '').to_i(16) : Float::INFINITY }

  belongs_to :round, inverse_of: :matches
  belongs_to :player1, class_name: 'Player'
  belongs_to :player2, class_name: 'Player', optional: true

  has_one :event, through: :round
  has_one :timer, dependent: :destroy, inverse_of: :match

  before_validation do
    self.player_ids = player_ids&.sort_by(&PLAYER_IDS_COMPARATOR)
    self.winner_id  = player1_id if player2_id.nil?
    self.complete   = winner_id.present? || draw?
  end

  validates :winner_id, absence: { if: :draw? }
  validates :table, numericality: { greater_than: 0 }

  validate if: -> { player1_changed? || player2_changed? } do
    # Prevent players 1 and 2 from being the same.
    errors.add(:player1, :same_as_player2) if player1 == player2
  end

  validate if: -> { round && player1_changed? } do
    # Ensure that player 1 is a member of the event.
    errors.add(:player1, :not_found) unless round.event.players.include?(player1)
  end

  validate if: -> { round && player2_changed? } do
    # Ensure that player 2 is a member of the event, or that it is a BYE.
    errors.add(:player2, :not_found) unless player2.nil? || round.event.players.include?(player2)
  end

  validate if: :winner_id? do
    # Ensure the selected winner is actually a part of the match.
    errors.add(:winner_id, :not_in_match) unless winner_id.in?(player_ids)
  end

  validate if: :complete?, on: :update do
    # Prevent players from being reassigned in completed matches.
    errors.add(:player1, :cannot_be_changed) if player1_changed?
    errors.add(:player2, :cannot_be_changed) if player2_changed?
  end

  # Recalculate the wins/losses/draws counts if the result of the match was changed.
  after_save :recalculate_player_statistics!, if: :saved_change_to_match_result?

  after_save if: -> { saved_change_to_complete?(to: true) } do
    round.run_callbacks(:match_completion)
  end

  after_soft_delete unless: -> { round.deleted? } do
    round.run_callbacks(:match_completion)
  end

  # @!method self.complete
  #   @return [Class<Match>]
  scope :complete, -> { where(complete: true) }

  # @!method self.draw
  #   @return [Class<Match>]
  scope :draw, -> { where(draw: true) }

  # @!method self.with_player(player)
  #   @param player [Player]
  #   @return [Class<Match>]
  scope :with_player, lambda { |player|
    where(player1: player).or(where(player2: player))
  }

  scope :where_winner, -> (player) { where(winner_id: player) }
  scope :where_loser, -> (player) { with_player(player).where.not(winner_id: [player, nil]) }

  scope :paired_first, -> { order(Arel.sql(<<-SQL.squish) => 'ASC') }
    CASE WHEN "matches"."player2_id" IS NULL THEN 1 ELSE 0 END
  SQL

  # Returns the IDs of the players in the match as a tuple.
  #
  # @return [(String, String), (String, nil)]
  def player_ids
    [player1_id, player2_id]
  end

  # Sets the players in the match by their IDs.
  #
  # @param ids [(String, String), (String, nil)]
  # @return [void]
  def player_ids=(ids)
    self.player1_id, self.player2_id = ids
  end

  # Returns the players in the match as a tuple.
  #
  # @return [(Player, Player), (Player, nil)]
  def players
    [player1, player2]
  end

  # Sets the players in the match.
  #
  # @param players [(Player, Player), (Player, nil)]
  # @return [void]
  def players=(players)
    self.player1, self.player2 = players
  end

  # Returns the winner of the match.
  #
  # @return [Player, nil]
  def winner
    winner_id && (player1_id == winner_id ? player1 : player2)
  end

  # Returns the loser of the match.
  #
  # @return [Player, nil]
  def loser
    winner_id && (player1_id == winner_id ? player2 : player1)
  end

  # Determines whether the result of the match was changed by the last save.
  # This includes the winner being assigned, the match being drawn, or the match being deleted/restored.
  #
  # @return [Boolean]
  def saved_change_to_match_result?
    saved_change_to_winner_id? || saved_change_to_draw? || saved_change_to_deleted?
  end

private

  # @return [void]
  def recalculate_player_statistics!
    players.compact.each(&:calculate_statistics!)
  end
end
