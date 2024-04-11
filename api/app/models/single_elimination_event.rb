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

  store_accessor :data, :swiss_event_id, :pairing_mode

  has_many :players, class_name: 'SingleEliminationPlayer', dependent: :destroy, inverse_of: :event

  validates :swiss_event_id, presence: true
  validates :pairing_mode, inclusion: { in: PAIRING_MODES }
  validates :players, presence: true

  validate on: :create, if: -> { players.any? } do
    # ensure that the number of players is a power of two so that we can pair them up
    if (base = Math.log2(players.length)).round != base
      errors.add(:players, :must_be_power_of_two, count: players.length, lower: 2**base.floor, upper: 2**base.ceil)
    end
  end

  # The maximum number of rounds that can be played in this event.
  #
  # @return [Integer]
  def maximum_number_of_rounds
    Math.log2(players.length).to_i
  end

  # The number of players in a given round.
  #
  # @param round_number [Integer]
  # @return [Integer]
  # @raise [ArgumentError] if round_number is not positive
  def number_of_players_in_round(round_number)
    round_number.positive? or
      raise ArgumentError, 'round_number must be positive'

    players.length / (2**(round_number - 1))
  end

  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings(round_number)
    SingleEliminationPlayerPairingService.new(self).generate_pairings(round_number)
  end
end
