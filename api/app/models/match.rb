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
  include Moonfire::Model
  include SoftDeletable

  attr_readonly :round_id

  # Ensure a deterministic order of player IDs.
  # Also ensure that the first player ID is always one that is present.
  PLAYER_IDS_COMPARATOR = -> (id) { id ? id.tr('-', '').to_i(16) : Float::INFINITY }

  belongs_to :round, inverse_of: :matches
  belongs_to :player1, class_name: 'Player'
  belongs_to :player2, class_name: 'Player', optional: true

  has_one :event, through: :round

  validates :winner_id, absence: { if: :draw? }
  validates :table, numericality: { greater_than: 0 }

  validate do
    errors.add(:player1, :same_as_player2) if player2_id.present? && player1_id == player2_id
  end

  validate if: -> { round && player1_id_changed? } do
    errors.add(:player1, :not_found) unless round.event.players.include?(player1)
  end

  validate if: -> { round && player2_id_changed? } do
    errors.add(:player2, :not_found) unless player2.nil? || round.event.players.include?(player2)
  end

  validate if: :winner_id? do
    errors.add(:winner_id, :not_in_match) unless winner_id.in?(player_ids)
  end

  before_validation do
    self.player_ids = player_ids&.sort_by(&PLAYER_IDS_COMPARATOR)
  end

  before_save do
    self.winner_id = player1_id if player2_id.nil?
  end

  publishes_messages_on :create, :update, :destroy

  # @!method self.complete
  #   @return [Class<Match>]
  scope :complete, -> { where.not(winner_id: nil).or(draw) }

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

  # Determines whether the match is complete.
  #
  # @return [Boolean]
  def complete?
    winner_id.present? || draw?
  end

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
end
