# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id         :uuid             primary key
#  opponent_ids      :uuid             is an Array
#  opponent_win_rate :decimal(, )
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

  it 'aggregates a list of opponents the player has faced' do
    opponent_ids = player.matches.flat_map(&:player_ids).excluding(player.id)
    expect(player_score_card.opponent_ids).to match_array(opponent_ids)
  end
end
