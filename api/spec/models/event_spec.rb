# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#
require 'rails_helper'

RSpec.describe Event, type: :model do
  subject(:event) { build(:event) }

  it 'has a valid factory' do
    expect(event).to be_valid
  end

  it 'is invalid without a name' do
    event.name = nil
    expect(event).to be_invalid
  end

  it 'is invalid with a name longer than 50 characters' do
    event.name = 'a' * 51
    expect(event).to be_invalid
  end
end
