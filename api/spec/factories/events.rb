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

      players do
        build_list(:player, players_count, event: instance)
      end
    end

    trait :with_rounds do
      with_players

      transient do
        rounds_count { 3 }
      end

      rounds do
        build_list(:round, rounds_count, event: instance)
      end
    end
  end
end
