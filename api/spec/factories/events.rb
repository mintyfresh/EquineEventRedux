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
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
FactoryBot.define do
  factory :event do
    sequence(:name) { |n| "#{Faker::Book.title.first(45)} #{n}" }

    trait :with_players do
      transient do
        players_count { 3 }
      end

      after(:build) do |event, e|
        event.players = build_list(:player, e.players_count, event:)
      end
    end
  end
end
