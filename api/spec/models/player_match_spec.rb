# frozen_string_literal: true

# == Schema Information
#
# Table name: player_matches
#
#  match_id    :uuid
#  round_id    :uuid
#  player_id   :uuid
#  opponent_id :uuid
#  table       :integer
#  complete    :boolean
#  result      :text
#
require 'rails_helper'

RSpec.describe PlayerMatch do
  let(:match) { create(:match) }

  it 'exists for every player in a match', :aggregate_failures do
    match.players.each.with_index(1) do |player, index|
      expect(described_class.find_by(player:, match:)).to be_present, "Record not found for player #{index}"
    end
  end

  it 'contains the correct opponent for each player', :aggregate_failures do
    player_match = described_class.find_by(player: match.player1, match:)
    expect(player_match.opponent).to eq(match.player2)
  end

  it 'correctly identifies the winner of the match', :aggregate_failures do
    match.update(winner_id: match.player_ids.sample)
    expect(described_class.find_by(player: match.winner, match:).result).to eq('win')
    expect(described_class.find_by(player: match.loser, match:).result).to eq('loss')
  end

  it 'correctly identifies a draw', :aggregate_failures do
    match.update(draw: true)
    expect(described_class.find_by(player: match.player1, match:).result).to eq('draw')
    expect(described_class.find_by(player: match.player2, match:).result).to eq('draw')
  end
end
