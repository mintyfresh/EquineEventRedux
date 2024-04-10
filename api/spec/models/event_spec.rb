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
#  slug       :string           not null
#  type       :string           not null
#  data       :jsonb            not null
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
require 'rails_helper'

RSpec.describe Event do
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

  it 'is invalid with a duplicate name' do
    create(:swiss_event, name: event.name)
    expect(event).to be_invalid
  end
end
