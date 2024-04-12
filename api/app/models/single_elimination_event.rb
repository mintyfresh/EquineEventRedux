# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#  slug       :string           not null
#  deleted_in :uuid
#  type       :string           not null
#  data       :jsonb            not null
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
class SingleEliminationEvent < Event
  PAIRING_MODES = %w[top_to_bottom sequential].freeze

  store_accessor :data, :pairing_mode

  has_many :players, class_name: 'SingleEliminationPlayer', dependent: :destroy, inverse_of: :event

  validates :pairing_mode, inclusion: { in: PAIRING_MODES }

  # The number of players in the event.
  #
  # @return [Integer]
  def active_players_count
    players.loaded? ? players.count(&:active?) : players.active.count
  end

  # The maximum number of rounds that can be played in this event.
  #
  # @return [Integer]
  def maximum_number_of_rounds
    # round up to the nearest integer
    # additional rounds are added to the event to accommodate byes
    Math.log2(active_players_count).ceil
  end

  # The number of players in a given round.
  #
  # @param round_number [Integer]
  # @return [Integer]
  # @raise [ArgumentError] if round_number is not positive
  def number_of_players_in_round(round_number)
    round_number.positive? or
      raise ArgumentError, 'round_number must be positive'

    # the total number of player "slots" in the event, including byes
    # these are added to pad the players list to be a power of 2
    total_player_slots_count = 2**maximum_number_of_rounds

    players_in_round = total_player_slots_count / (2**(round_number - 1))
    players_in_round = active_players_count if players_in_round > active_players_count

    players_in_round
  end

  # @return [Boolean]
  def draws_permitted?
    false
  end

  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings(round_number)
    SingleEliminationPlayerPairingService.new(self).generate_pairings(round_number)
  end
end
