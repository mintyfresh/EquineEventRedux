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
#  type                    :string           not null
#  data                    :jsonb            not null
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

RSpec.describe SingleEliminationPlayer do
  subject(:player) { build(:single_elimination_player) }

  it 'has a valid factory' do
    expect(player).to be_valid
      .and be_a(described_class)
  end

  it 'is invalid without a swiss player ID' do
    player.swiss_player_id = nil
    expect(player).to be_invalid
  end

  it 'is invalid without a swiss ranking' do
    player.swiss_ranking = nil
    expect(player).to be_invalid
  end

  it 'is invalid with a non-integer swiss ranking' do
    player.swiss_ranking = 1.5
    expect(player).to be_invalid
  end

  it 'is invalid with a non-positive swiss ranking' do
    player.swiss_ranking = 0
    expect(player).to be_invalid
  end
end
