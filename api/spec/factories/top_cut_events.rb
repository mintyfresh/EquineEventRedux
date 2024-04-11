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
FactoryBot.define do
  factory :top_cut_event, class: 'TopCutEvent', parent: :event do
    type { 'TopCutEvent' }
    swiss_event_id { SecureRandom.uuid }
    players { build_list(:top_cut_player, players_count, event: instance) }
    pairing_mode { TopCutEvent::PAIRING_MODES.sample }

    transient do
      players_count { 8 }
    end
  end
end
