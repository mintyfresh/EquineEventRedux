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
#  deleted_at :datetime
#
# Indexes
#
#  index_rounds_on_event_id             (event_id)
#  index_rounds_on_event_id_and_number  (event_id,number) UNIQUE WHERE (deleted_at IS NULL)
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

  it 'sets a round number when created' do
    expect { round.save }.to change { round.number }.to(1)
  end
end
