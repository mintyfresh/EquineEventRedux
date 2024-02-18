# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id                :uuid             not null, primary key
#  event_id          :uuid             not null
#  preset_id         :uuid             not null
#  current_phase_id  :uuid
#  previous_phase_id :uuid
#  label             :string
#  phase_expires_at  :datetime
#  paused_at         :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_timers_on_current_phase_id   (current_phase_id)
#  index_timers_on_event_id           (event_id)
#  index_timers_on_preset_id          (preset_id)
#  index_timers_on_previous_phase_id  (previous_phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (current_phase_id => timer_preset_phases.id)
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#  fk_rails_...  (previous_phase_id => timer_preset_phases.id)
#
require 'rails_helper'

RSpec.describe Timer do
  subject(:timer) { build(:timer) }

  it 'has a valid factory' do
    expect(timer).to be_valid
  end

  it 'is invalid without an event' do
    timer.event = nil
    expect(timer).to be_invalid
  end

  it 'is invalid without a preset' do
    timer.preset = nil
    expect(timer).to be_invalid
  end

  it "sets the preset's first phase as the current phase as part of creation" do
    timer.save!
    expect(timer.current_phase).to eq(timer.preset.phases.first)
  end

  it 'sets the phase expiration time as part of creation', :freeze_time do
    timer.save!
    expect(timer.phase_expires_at).to eq(Time.current + timer.current_phase.duration)
  end

  describe '#pause!' do
    subject(:pause!) { timer.pause! }

    let(:timer) { create(:timer) }

    it 'pauses the timer' do
      pause!
      expect(timer).to be_paused
    end

    it 'freezes the remaining time', :freeze_time do
      time_remaining = timer.time_remaining
      pause!
      travel 30.minutes
      expect(timer.time_remaining).to eq(time_remaining)
    end

    it 'prevents the timer from moving to the next phase' do
      pause!
      expect { timer.move_to_next_phase! }.not_to change { timer.current_phase }
    end

    it 'prevents the timer from skipping to the next phase' do
      pause!
      expect { timer.skip_to_next_phase! }.not_to change { timer.current_phase }
    end
  end

  describe '#unpause!' do
    subject(:unpause!) { timer.unpause! }

    let(:timer) { create(:timer, :paused) }

    it 'unpauses the timer' do
      unpause!
      expect(timer).not_to be_paused
    end

    it 'resumes the remaining time', :freeze_time do
      time_remaining = timer.time_remaining
      travel 30.minutes
      unpause!
      expect(timer.time_remaining).to eq(time_remaining)
    end
  end
end
