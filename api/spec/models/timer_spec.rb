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

  it 'is valid without a label' do
    timer.label = nil
    expect(timer).to be_valid
  end

  it 'sets the expiration time as part of creation', :freeze_time do
    timer.save!
    expect(timer.expires_at).to eq(Time.current + timer.total_duration)
  end

  it 'creates phases from the preset' do
    timer.save!
    expect(timer.phases.map(&:preset_phase)).to eq(timer.preset.phases)
  end

  it 'starts at teh first phase' do
    timer.save!
    expect(timer.current_phase).to eq(timer.phases.first)
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
