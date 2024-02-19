# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  preset_id  :uuid             not null
#  label      :string
#  expires_at :datetime
#  paused_at  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_timers_on_event_id   (event_id)
#  index_timers_on_preset_id  (preset_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#
FactoryBot.define do
  factory :timer do
    event
    preset factory: :timer_preset

    trait :paused do
      paused_at { Time.current }
    end
  end
end
