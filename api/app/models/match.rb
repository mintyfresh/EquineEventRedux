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
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_matches_on_player1_id  (player1_id)
#  index_matches_on_player2_id  (player2_id)
#  index_matches_on_round_id    (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (player1_id => players.id)
#  fk_rails_...  (player2_id => players.id)
#  fk_rails_...  (round_id => rounds.id)
#
class Match < ApplicationRecord
  # Ensure a deterministic order of player IDs.
  # Also ensure that the first player ID is always one that is present.
  PLAYER_IDS_COMPARATOR = -> (id) { id ? id.tr('-', '').to_i(16) : Float::INFINITY }

  belongs_to :round, inverse_of: :matches
  belongs_to :player1, class_name: 'Player'
  belongs_to :player2, class_name: 'Player', optional: true

  has_one :event, through: :round

  validates :winner_id, absence: { if: :draw? }

  validate do
    errors.add(:player1, :same_as_player2) if player1_id == player2_id
  end

  validate if: -> { round && player1_id_changed? } do
    errors.add(:player1, :not_found) unless round.event.players.include?(player1)
  end

  validate if: -> { round && player2_id_changed? } do
    errors.add(:player2, :not_found) unless player2.nil? || round.event.players.include?(player2)
  end

  validate if: :winner_id? do
    errors.add(:winner_id, :not_in_match) unless winner_id.in?([player1_id, player2_id])
  end

  before_validation do
    self.player_ids = player_ids&.sort_by(&PLAYER_IDS_COMPARATOR)
  end

  before_save do
    self.winner_id = player1_id if player2_id.nil?
  end

  scope :draw, -> { where(draw: true) }

  scope :with_player, lambda { |player|
    where(player1: player).or(where(player2: player))
  }

  scope :paired_first, -> { order(Arel.sql(<<-SQL.squish)) }
    CASE WHEN "matches"."player2_id" IS NULL THEN 1 ELSE 0 END
  SQL

  # @return [Array<(String, String | nil)>]
  def player_ids
    [player1_id, player2_id]
  end

  # @param ids [Array<(String, String | nil)>]
  # @return [void]
  def player_ids=(ids)
    self.player1_id, self.player2_id = ids
  end
end
