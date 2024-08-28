# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_phases
#
#  id                   :uuid             not null, primary key
#  timer_id             :uuid             not null
#  preset_phase_id      :uuid             not null
#  audio_clip_id        :uuid
#  name                 :string           not null
#  position             :integer          not null
#  duration_amount      :integer          not null
#  duration_unit        :string           not null
#  offset_from_start    :integer          not null
#  offset_from_end      :integer          not null
#  extension_in_seconds :integer          default(0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  colour               :integer          default(0), not null
#
# Indexes
#
#  index_timer_phases_on_audio_clip_id    (audio_clip_id)
#  index_timer_phases_on_preset_phase_id  (preset_phase_id)
#  index_timer_phases_on_timer_id         (timer_id)
#
# Foreign Keys
#
#  fk_rails_...  (audio_clip_id => audio_clips.id)
#  fk_rails_...  (preset_phase_id => timer_preset_phases.id)
#  fk_rails_...  (timer_id => timers.id)
#
require 'rails_helper'
require_relative 'concerns/timer_phaseable'

RSpec.describe TimerPhase do
  subject(:timer_phase) { build(:timer_phase) }

  it 'has a valid factory' do
    expect(timer_phase).to be_valid
  end

  it_behaves_like TimerPhaseable

  it 'is invalid without a timer' do
    timer_phase.timer = nil
    expect(timer_phase).to be_invalid
  end

  it 'is invalid without a preset phase' do
    timer_phase.preset_phase = nil
    expect(timer_phase).to be_invalid
  end

  it 'is invalid when the extension duration is nil' do
    timer_phase.extension_in_seconds = nil
    expect(timer_phase).to be_invalid
  end

  context 'with a time extension' do
    subject(:timer_phase) { build(:timer_phase, extension_in_seconds:) }

    let(:extension_in_seconds) { [30, 60, 90].sample }

    it 'is valid' do
      expect(timer_phase).to be_valid
    end

    it 'includes the extension in the total duration' do
      expect(timer_phase.duration).to eq(timer_phase.preset_phase.duration + extension_in_seconds)
    end

    it 'includes the extension in the total duration in seconds' do
      expect(timer_phase.duration_in_seconds).to eq(timer_phase.preset_phase.duration_in_seconds + extension_in_seconds)
    end
  end
end
