# frozen_string_literal: true

# == Schema Information
#
# Table name: audio_clips
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  system_ref :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_audio_clips_on_system_ref  (system_ref) UNIQUE
#
require 'rails_helper'

RSpec.describe AudioClip do
  subject(:audio_clip) { build(:audio_clip) }

  it 'has a valid factory' do
    expect(audio_clip).to be_valid
  end
end
