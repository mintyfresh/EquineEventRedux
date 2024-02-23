# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player1_id :uuid             not null
#  player2_id :uuid
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  table      :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#  deleted_in :uuid
#  complete   :boolean          default(FALSE), not null
#
# Indexes
#
#  index_matches_on_player1_id          (player1_id)
#  index_matches_on_player2_id          (player2_id)
#  index_matches_on_round_id            (round_id)
#  index_matches_on_round_id_and_table  (round_id,table) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (player1_id => players.id)
#  fk_rails_...  (player2_id => players.id)
#  fk_rails_...  (round_id => rounds.id)
#
require 'rails_helper'

RSpec.describe Match do
  subject(:match) { build(:match) }

  it 'has a valid factory' do
    expect(match).to be_valid
  end

  it 'is invalid without a round' do
    match.round = nil
    expect(match).to be_invalid
  end

  it 'is invalid without a player 1' do
    match.player1 = nil
    match.player2 = nil
    expect(match).to be_invalid
  end

  it 'is valid without a player 2' do
    match.player2 = nil
    expect(match).to be_valid
  end

  it 'is invalid without a table number' do
    match.table = nil
    expect(match).to be_invalid
  end

  it 'is valid without a winner' do
    match.winner_id = nil
    expect(match).to be_valid
  end

  it 'is invalid when player 1 is the same as player 2' do
    match.player1_id = match.player2_id
    expect(match).to be_invalid
  end

  it 'is invalid when player 1 is not in the round' do
    match.player1 = create(:player)
    expect(match).to be_invalid
  end

  it 'is invalid when player 2 is not in the round' do
    match.player2 = create(:player)
    expect(match).to be_invalid
  end

  it 'is invalid when winner is not in the match' do
    match.winner_id = SecureRandom.uuid
    expect(match).to be_invalid
  end

  it 'is invalid when the match has a winner and is a draw' do
    match.draw = true
    match.winner_id = match.player1_id
    expect(match).to be_invalid
  end

  it 'automatically sets a winner for a match if it only has one player' do
    match.player2 = nil
    match.save
    expect(match.winner_id).to eq(match.player1_id)
  end

  it 'does not mark the match as complete if it has no winner and is not a draw' do
    match.winner_id = nil
    match.draw = false
    match.save
    expect(match).not_to be_complete
  end

  it 'automatically sets the match as complete if it has a winner' do
    match.winner_id = match.player1_id
    match.save
    expect(match).to be_complete
  end

  it 'automatically sets the match as complete if it is a draw' do
    match.draw = true
    match.save
    expect(match).to be_complete
  end

  it 'automatically sets the round as complete if the final match is complete', :aggregate_failures do
    match.save
    create_list(:match, 2, :with_winner, round: match.round)
    expect(match.round.reload).not_to be_complete
    match.update!(draw: true)
    expect(match.round).to be_complete
  end

  it 'automatically sets the round as complete if the final match is deleted', :aggregate_failures do
    match.save
    create_list(:match, 2, :with_winner, round: match.round)
    expect(match.round.reload).not_to be_complete
    match.destroy!
    expect(match.round).to be_complete
  end
end
