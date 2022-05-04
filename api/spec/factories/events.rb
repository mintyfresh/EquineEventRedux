# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
FactoryBot.define do
  factory :event do
    name { Faker::Book.title }

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
