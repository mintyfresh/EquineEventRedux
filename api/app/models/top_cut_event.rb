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
#  type       :string           not null
#  data       :jsonb            not null
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
class TopCutEvent < Event
  PAIRING_MODES = %w[top_to_bottom sequential].freeze

  store_accessor :data, :swiss_event_id, :pairing_mode

  validates :swiss_event_id, presence: true
  validates :pairing_mode, inclusion: { in: PAIRING_MODES }
  validates :players, presence: true

  # ensure an even number of players are present
  validate on: :create, if: -> { players.any? } do
    players.length.even? or errors.add(:players, :odd)
  end
end
