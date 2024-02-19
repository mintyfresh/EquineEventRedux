# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_preset_phases
#
#  id                :uuid             not null, primary key
#  timer_preset_id   :uuid             not null
#  audio_clip_id     :uuid
#  name              :string           not null
#  position          :integer          not null
#  duration_amount   :integer          not null
#  duration_unit     :string           not null
#  offset_from_start :integer          not null
#  offset_from_end   :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
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
require_relative 'concerns/timer_phaseable'

RSpec.describe TimerPresetPhase do
  subject(:timer_preset_phase) { build(:timer_preset_phase) }

  it 'has a valid factory' do
    expect(timer_preset_phase).to be_valid
  end

  it_behaves_like TimerPhaseable

  it 'is invalid without a timer preset' do
    timer_preset_phase.timer_preset = nil
    expect(timer_preset_phase).to be_invalid
  end

  it 'is invalid when the name is too long' do
    timer_preset_phase.name = 'a' * described_class::NAME_MAX_LENGTH.next
    expect(timer_preset_phase).to be_invalid
  end

  it 'assigns a position upon creation' do
    timer_preset_phase.position = nil
    timer_preset_phase.save!
    expect(timer_preset_phase.position).to be_present
  end
end
