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
require 'rails_helper'

RSpec.describe Timer do
  subject(:timer) { build(:timer) }

  it 'has a valid factory' do
    expect(timer).to be_valid
  end

  it 'is invalid without a preset' do
    timer.preset = nil
    expect(timer).to be_invalid
  end

  it 'is invalid without an round' do
    timer.round = nil
    expect(timer).to be_invalid
  end

  it 'is valid without an match' do
    timer.match = nil
    expect(timer).to be_valid
  end

  it 'is invalid when the match does not belong to the round' do
    timer.match = build(:match)
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

  it 'starts at the first phase' do
    timer.save!
    expect(timer.current_phase).to eq(timer.phases.first)
  end

  it 'marks itself as primary if no other timers are active for the round' do
    timer.save!
    expect(timer).to be_primary
  end

  context 'when a primary timer already exists for the round' do
    subject(:timer) { build(:timer, round:) }

    let!(:round) { create(:round, :with_timers, timers_count: 1) }
    let(:primary_timer) { round.timers.first }

    it 'does not mark itself as primary' do
      timer.save!
      expect(timer).not_to be_primary
    end

    it 'replaces the primary timer if it is expired', :aggregate_failures do
      primary_timer.update!(expires_at: 1.second.ago)
      timer.save!
      expect(primary_timer.reload).not_to be_primary
      expect(timer).to be_primary
    end

    it 'replaces the primary timer if manually set to primary', :aggregate_failures do
      timer.primary = true
      timer.save!
      expect(primary_timer.reload).not_to be_primary
      expect(timer).to be_primary
    end
  end

  it 'publishes a message on create' do
    expect { timer.save! }.to have_published(described_class, :create)
      .with(timer:)
  end

  it 'publishes a message on update' do
    timer.save!
    timer.label = 'New label'
    expect { timer.save! }.to have_published(described_class, :update)
      .with(timer:, changes: a_hash_including('label' => [nil, 'New label']))
  end

  it 'does not publish a message on update if there are no changes' do
    timer.save!
    expect { timer.save! }.not_to have_published(described_class, :update)
  end

  it 'publishes a message on destroy' do
    timer.save!
    expect { timer.destroy! }.to have_published(described_class, :destroy)
      .with(timer:, changes: {})
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

  describe '#dup_with_extension' do
    subject(:dup_with_extension) { timer.dup_with_extension(extension_in_seconds:) }

    let(:timer) { create(:timer) }
    let(:extension_in_seconds) { [30, 60, 90].sample }

    it 'returns a new timer', :aggregate_failures do
      expect(dup_with_extension).to be_a(described_class)
      expect(dup_with_extension).not_to eq(timer)
    end

    it 'starts the new timer at the same phase' do
      expect(dup_with_extension.current_phase.preset_phase).to eq(timer.current_phase.preset_phase)
    end

    it 'adds the extension to the current phase of the new timer', :aggregate_failures do
      expect(dup_with_extension.current_phase.extension_in_seconds).to eq(extension_in_seconds)
      expect(dup_with_extension.current_phase.duration).to eq(timer.current_phase.duration + extension_in_seconds)
    end

    it 'adds the extension to the total duration of the new timer' do
      dup_with_extension.save!
      expect(dup_with_extension.total_duration).to eq(timer.total_duration + extension_in_seconds.seconds)
    end

    context 'when the source timer is the primary timer' do
      let(:timer) { create(:timer, :primary) }

      it 'does not mark the new timer as primary' do
        expect(dup_with_extension).not_to be_primary
      end
    end
  end
end
