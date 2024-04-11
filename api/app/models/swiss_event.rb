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
class SwissEvent < Event
  has_many :players, class_name: 'SwissPlayer', dependent: :destroy, inverse_of: :event

  # @param round_number [Integer]
  # @return [Array<(SwissPlayer, SwissPlayer), (SwissPlayer, nil)>]
  def generate_pairings(_round_number)
    SwissPlayerPairingService.new(self).generate_pairings
  end
end
