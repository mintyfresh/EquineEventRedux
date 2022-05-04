# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  name       :citext           not null
#  paid       :boolean          default(FALSE), not null
#  dropped    :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#
# Indexes
#
#  index_players_on_event_id           (event_id)
#  index_players_on_event_id_and_name  (event_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
require 'rails_helper'

RSpec.describe Player, type: :model do
  subject(:player) { build(:player) }

  it 'has a valid factory' do
    expect(player).to be_valid
  end

  it 'is invalid without an event' do
    player.event = nil
    expect(player).to be_invalid
  end

  it 'is invalid without a name' do
    player.name = nil
    expect(player).to be_invalid
  end

  it 'is invalid with a name longer than 50 characters' do
    player.name = 'a' * 51
    expect(player).to be_invalid
  end
end
