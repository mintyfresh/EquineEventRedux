# frozen_string_literal: true

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
require 'rails_helper'

RSpec.describe TimerPresetPhase do
  subject(:timer_preset_phase) { build(:timer_preset_phase) }

  it 'has a valid factory' do
    expect(timer_preset_phase).to be_valid
  end

  it 'is invalid without a name' do
    timer_preset_phase.name = nil
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid when the name is too long' do
    timer_preset_phase.name = 'a' * described_class::NAME_MAX_LENGTH.next
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid without a duration amount' do
    timer_preset_phase.duration_amount = nil
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid with a non-positive duration amount' do
    timer_preset_phase.duration_amount = 0
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid without a duration unit' do
    timer_preset_phase.duration_unit = nil
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid with an unknown duration unit' do
    timer_preset_phase.duration_unit = 'unknown'
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid with a duration less than 10 seconds' do
    timer_preset_phase.duration_amount = 1
    timer_preset_phase.duration_unit = 'seconds'
    expect(timer_preset_phase).to be_invalid
  end
end
