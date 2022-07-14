# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  name       :citext           not null
#  paid       :boolean          default(FALSE), not null
#  dropped    :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
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

  belongs_to :event, inverse_of: :players

  has_one :score_card, class_name: 'PlayerScoreCard', dependent: false, inverse_of: :player

  validates :name, length: { maximum: 50 }, presence: true, uniqueness: { scope: :event }

  scope :active, -> { non_deleted.where(paid: true, dropped: false) }

  # @return [Boolean]
  def active?
    !deleted? && paid? && !dropped?
  end

  # @return [ActiveRecord::Relation<Match>]
  def matches
    Match.with_player(self)
  end

  # @param player [Player, nil]
  # @return [Boolean]
  def has_been_matched_with?(player)
    score_card.opponent_ids.include?(player&.id)
  end

  # @!method score
  #   @return [Integer]
  # @!method opponent_win_rate
  #   @return [Float]
  delegate :score, :opponent_win_rate, to: :score_card, allow_nil: true

  # Returns the number of times this player has been matched with the specified player.
  #
  # @param player [Player, nil]
  # @return [Integer]
  def times_matched_with(player)
    matches
      .joins(:round)
      .merge(Round.non_deleted)
      .with_player(player)
      .count
  end
end
