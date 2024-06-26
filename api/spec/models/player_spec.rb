# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id                      :uuid             not null, primary key
#  event_id                :uuid             not null
#  name                    :citext           not null
#  paid                    :boolean          default(FALSE), not null
#  dropped                 :boolean          default(FALSE), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  deleted_at              :datetime
#  completed_matches_count :integer          default(0), not null
#  wins_count              :integer          default(0), not null
#  draws_count             :integer          default(0), not null
#  losses_count            :integer          default(0), not null
#  score                   :integer          default(0), not null
#  maximum_possible_score  :integer          default(0), not null
#  deleted_in              :uuid
#
# Indexes
#
#  index_players_on_event_id           (event_id)
#  index_players_on_event_id_and_name  (event_id,name) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
require 'rails_helper'

RSpec.describe Player do
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
