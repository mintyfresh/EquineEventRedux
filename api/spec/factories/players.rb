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
FactoryBot.define do
  factory :player do
    association :event, strategy: :build

    sequence(:name) { |n| "#{Faker::Internet.user_name} #{n}" }

    trait :paid do
      paid { true }
    end

    trait :dropped do
      dropped { true }
    end

    trait :deleted do
      deleted { true }
    end
  end
end
