# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id               :uuid             primary key
#  matches_count           :bigint
#  completed_matches_count :bigint
#  wins_count              :bigint
#  losses_count            :bigint
#  draws_count             :bigint
#  opponent_ids            :uuid             is an Array
#
require 'rails_helper'

RSpec.describe PlayerScoreCard do
  subject(:player_score_card) { player.score_card }

  let(:player) { create(:player) }

  before(:each) do
    create_list(:match, 3, event: player.event, player1: player)
    create_list(:match, 2, event: player.event, player2: player)
  end

  it 'exists for every player' do
    expect(player_score_card).to be_present
  end

  it 'counts the number of matches the player has participated in' do
    expect(player_score_card.matches_count).to eq(5)
  end

  it 'counts the number of matches the player has completed' do
    player.matches.sample(2).each { |match| match.update!(winner_id: player.id) }
    expect(player_score_card.completed_matches_count).to eq(2)
  end

  it 'counts the number of matches the player has won' do
    player.matches.sample(3).each { |match| match.update!(winner_id: player.id) }
    expect(player_score_card.wins_count).to eq(3)
  end

  it 'counts the number of matches the player has lost' do
    player.matches.sample(4).each { |match| match.update!(winner_id: match.player_ids.excluding(player.id).first) }
    expect(player_score_card.losses_count).to eq(4)
  end

  it 'counts the number of matches the player has drawn' do
    player.matches.sample(2).each { |match| match.update!(draw: true) }
    expect(player_score_card.draws_count).to eq(2)
  end

  it 'aggregates a list of opponents the player has faced' do
    opponent_ids = player.matches.flat_map(&:player_ids).excluding(player.id)
    expect(player_score_card.opponent_ids).to match_array(opponent_ids)
  end
end
