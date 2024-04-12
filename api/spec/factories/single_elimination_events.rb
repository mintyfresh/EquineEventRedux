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
FactoryBot.define do
  factory :single_elimination_event, class: 'SingleEliminationEvent', parent: :event do
    type { 'SingleEliminationEvent' }
    pairing_mode { SingleEliminationEvent::PAIRING_MODES.sample }
    with_players

    transient do
      players_count { 8 }
    end

    trait :with_players do
      players do
        Array.new(players_count) do |index|
          build(:single_elimination_player, event: instance, swiss_ranking: index + 1)
        end
      end
    end
  end
end
