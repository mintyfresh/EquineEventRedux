# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player_ids :uuid             not null, is an Array
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_matches_on_round_id  (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (round_id => rounds.id)
#
class Match < ApplicationRecord
  # Ensure a deterministic order of player IDs.
  # Also ensure that the first player ID is always one that is present.
  PLAYER_IDS_COMPARATOR = -> (id) { id&.hash || Float::INFINITY }

  belongs_to :round, inverse_of: :matches

  has_one :event, through: :round

  validates :player_ids, presence: true
  validates :winner_id, absence: { if: :draw? }

  validate if: -> { round && player_ids_changed? } do
    errors.add(:player_ids, :invalid) if player_ids.size != 2 || player_ids.uniq.size != 2 || player_ids[0].nil?

    player_ids&.each_with_index do |player_id, index|
      next if player_id.nil? || event.players.any? { |player| player.id == player_id }

      errors.add("player_ids[#{index}]", :not_found)
    end
  end

  validate if: :winner_id? do
    errors.add(:winner_id, :not_in_match) unless player_ids.include?(winner_id)
  end

  before_validation do
    self.player_ids = player_ids&.sort_by(&PLAYER_IDS_COMPARATOR)
  end

  scope :draw, -> { where(draw: true) }

  scope :with_player, lambda { |player|
    where('"matches"."player_ids" @> ARRAY[?]::uuid[]', player)
  }

  # @return [String, nil]
  def player1_id
    player_ids[0]
  end

  # @return [String, nil]
  def player2_id
    player_ids[1]
  end
end
