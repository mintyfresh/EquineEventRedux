# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_presets
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  system_ref   :string
#  phases_count :integer          default(0), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_timer_presets_on_name        (name) UNIQUE
#  index_timer_presets_on_system_ref  (system_ref) UNIQUE
#
FactoryBot.define do
  factory :timer_preset do
    sequence(:name) { |n| "Timer #{Faker::Lorem.word} #{n}" }

    transient do
      phases_count { 3 }
    end

    phases do
      build_list(:timer_preset_phase, phases_count, timer_preset: instance)
    end
  end
end
