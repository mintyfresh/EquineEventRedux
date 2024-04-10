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

RSpec.describe TopCutEvent do
  subject(:event) { build(:top_cut_event) }

  it 'has a valid factory' do
    expect(event).to be_valid
      .and be_a(described_class)
  end

  it 'is invalid without players' do
    event.players = []
    expect(event).to be_invalid
  end

  it 'is invalid when the players count does not match the number of players' do
    event.players_count += 1
    expect(event).to be_invalid
  end
end
