# == Schema Information
#
# Table name: timer_preset_phases
#
#  id              :uuid             not null, primary key
#  timer_preset_id :uuid             not null
#  audio_clip_id   :uuid
#  name            :string           not null
#  position        :integer          not null
#  duration_amount :integer          not null
#  duration_unit   :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_timer_preset_phases_on_audio_clip_id             (audio_clip_id)
#  index_timer_preset_phases_on_timer_preset_id           (timer_preset_id)
#  index_timer_preset_phases_on_timer_preset_id_and_name  (timer_preset_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (audio_clip_id => audio_clips.id)
#  fk_rails_...  (timer_preset_id => timer_presets.id)
#
FactoryBot.define do
  factory :timer_preset_phase do
    timer_preset

    sequence(:name) { |n| "Phase #{Faker::Lorem.word} #{n}" }
    duration_amount { rand(1..10) }
    duration_unit { TimerPresetPhase::DURATION_UNITS.sample }
  end
end
