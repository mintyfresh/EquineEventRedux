# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PlayerPairingService, type: :service do
  subject(:service) { described_class.new }

  describe '#generate_pairings' do
    subject(:generate_pairings) { service.generate_pairings(players) }

    let(:players) { create_list(:player, 4, event:) }
    let(:event) { create(:event) }

    it 'returns a list of pairings' do
      expect(generate_pairings).to be_a(Array)
        .and all have_attributes(length: 2)
    end

    it 'includes all players in the pairings' do
      expect(generate_pairings.flatten).to match_array(players)
    end

    it 'positions the players with the highest rankings first' do
      players.shuffle.each_slice(2).each do |(player1, player2)|
        create(:match, event:, player1:, player2:, winner_id: [player1, player2].sample.id)
      end

      best_players = event.players.joins(:score_card).order(wins_count: :desc).first(2)
      expect(generate_pairings.first).to match_array(best_players)
    end

    context 'when there is an odd number of players' do
      let(:players) { create_list(:player, 5, event:) }

      it 'includes all players and one bye in the pairings' do
        expect(generate_pairings.flatten).to contain_exactly(*players, nil)
      end

      it 'positions the bye as the last pairing' do
        expect(generate_pairings.last[1]).to be_nil
      end
    end

    context 'when the list of players is empty' do
      let(:players) { [] }

      it 'returns an empty list' do
        expect(generate_pairings).to be_empty
      end
    end
  end
end
