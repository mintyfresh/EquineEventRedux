# frozen_string_literal: true

# == Schema Information
#
# Table name: rounds
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  number     :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_rounds_on_event_id             (event_id)
#  index_rounds_on_event_id_and_number  (event_id,number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
require 'rails_helper'

RSpec.describe Round, type: :model do
  subject(:round) { build(:round) }

  it 'has a valid factory' do
    expect(round).to be_valid
  end

  it 'is invalid without an event' do
    round.event = nil
    expect(round).to be_invalid
  end

  it 'is invalid without a number' do
    round.number = nil
    expect(round).to be_invalid
  end

  it 'is invalid with a number less than 1' do
    round.number = 0
    expect(round).to be_invalid
  end
end
