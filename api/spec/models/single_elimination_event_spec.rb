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
#  deleted_in :uuid
#  type       :string           not null
#  data       :jsonb            not null
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
require 'rails_helper'

RSpec.describe SingleEliminationEvent do
  subject(:event) { build(:single_elimination_event) }

  it 'has a valid factory' do
    expect(event).to be_valid
      .and be_a(described_class)
  end

  it 'is invalid without a pairing mode' do
    event.pairing_mode = nil
    expect(event).to be_invalid
  end

  it 'is invalid with an unknown pairing mode' do
    event.pairing_mode = 'unknown'
    expect(event).to be_invalid
  end
end
