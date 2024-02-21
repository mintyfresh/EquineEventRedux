# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_presets
#
#  id             :uuid             not null, primary key
#  name           :string           not null
#  system_ref     :string
#  phases_count   :integer          default(0), not null
#  total_duration :interval         not null
#  last_used_at   :datetime
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_timer_presets_on_name        (name) UNIQUE
#  index_timer_presets_on_system_ref  (system_ref) UNIQUE
#
require 'rails_helper'

RSpec.describe TimerPreset do
  subject(:timer_preset) { build(:timer_preset) }

  it 'has a valid factory' do
    expect(timer_preset).to be_valid
  end

  it 'is invalid without a name' do
    timer_preset.name = nil
    expect(timer_preset).to be_invalid
  end

  it 'is invalid with a duplicate name' do
    create(:timer_preset, name: timer_preset.name)
    expect(timer_preset).to be_invalid
  end

  it 'is invalid when the name is too long' do
    timer_preset.name = 'a' * described_class::NAME_MAX_LENGTH.next
    expect(timer_preset).to be_invalid
  end

  it 'is invalid without any phases' do
    timer_preset.phases = []
    expect(timer_preset).to be_invalid
  end

  it 'is invalid with too many phases' do
    timer_preset.phases = build_list(:timer_preset_phase, described_class::PHASES_MAX_COUNT.next, timer_preset:)
    expect(timer_preset).to be_invalid
  end

  it 'is invalid when two phases have the same name', :aggregate_failures do
    timer_preset.phases = build_list(:timer_preset_phase, 2, timer_preset:, name: 'Phase 1')
    expect(timer_preset).to be_invalid
    expect(timer_preset.errors).to be_of_kind('phases[1].name', :taken)
  end
end
