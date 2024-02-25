# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id         :uuid             not null, primary key
#  preset_id  :uuid             not null
#  round_id   :uuid             not null
#  match_id   :uuid
#  label      :string
#  expires_at :datetime
#  paused_at  :datetime
#  primary    :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_timers_on_match_id   (match_id) UNIQUE
#  index_timers_on_preset_id  (preset_id)
#  index_timers_on_round_id   (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (match_id => matches.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#  fk_rails_...  (round_id => rounds.id)
#
FactoryBot.define do
  factory :timer do
    round
    preset factory: :timer_preset

    trait :primary do
      primary { true }
    end

    trait :paused do
      paused_at { Time.current }
    end

    trait :with_match do
      match { build(:match, round:) }
    end

    trait :with_label do
      label { Faker::Lorem.sentence }
    end
  end
end
