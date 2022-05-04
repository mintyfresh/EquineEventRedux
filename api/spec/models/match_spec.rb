# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player_ids :uuid             not null, is an Array
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_matches_on_round_id  (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (round_id => rounds.id)
#
require 'rails_helper'

RSpec.describe Match, type: :model do
  subject(:match) { build(:match) }

  it 'has a valid factory' do
    expect(match).to be_valid
  end

  it 'is invalid without a round' do
    match.round = nil
    expect(match).to be_invalid
  end

  it 'is invalid without a pair of player IDs' do
    match.player_ids = nil
    expect(match).to be_invalid
  end

  it 'is invalid with a list of player IDs of length less than 2' do
    match.player_ids.shift
    expect(match).to be_invalid
  end

  it 'is invalid with a list of player IDs of length greater than 2' do
    match.player_ids << create(:player, event: match.event).id
    expect(match).to be_invalid
  end

  it 'is invalid when the list of player IDs contains duplicates' do
    player = create(:player, event: match.event)
    match.player_ids = [player.id, player.id]
    expect(match).to be_invalid
  end

  it 'is invalid when the first player ID is null' do
    match.player_ids[0] = nil
    expect(match).to be_invalid
  end

  it 'is valid when the second player ID is null' do
    match.player_ids[1] = nil
    expect(match).to be_valid
  end

  it 'is invalid when one of the players is not in the event' do
    match.player_ids[0] = create(:player).id
    expect(match).to be_invalid
  end

  it 'is valid without a winner' do
    match.winner_id = nil
    expect(match).to be_valid
  end

  it 'is valid when the winner is one of the player IDs in the match' do
    match.winner_id = match.player_ids.sample
    expect(match).to be_valid
  end

  it 'is invalid when the winner is not in the match' do
    match.winner_id = create(:player).id
    expect(match).to be_invalid
  end

  it 'is invalid with a winner when the match is a draw' do
    match.draw = true
    match.winner_id = match.player_ids.sample
    expect(match).to be_invalid
  end
end
