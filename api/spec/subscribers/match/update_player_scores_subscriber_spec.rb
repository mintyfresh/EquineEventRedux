# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Match::UpdatePlayerScoresSubscriber, type: :subscriber do
  subject(:subscriber) { described_class }

  it 'accepts match create messages for completed matches' do
    match = create(:match, :with_winner)
    expect(subscriber).to accept(Match::CreateMessage.new(match:))
  end

  it 'does not accept match create messages for incomplete matches' do
    match = create(:match)
    expect(subscriber).not_to accept(Match::CreateMessage.new(match:))
  end

  it 'accepts match update messages for completed matches' do
    match = create(:match, :with_winner)
    expect(subscriber).to accept(Match::UpdateMessage.new(match:, changes: {}))
  end

  it 'accepts match update messages for previously complete matches' do
    match = create(:match)
    expect(subscriber).to accept(Match::UpdateMessage.new(match:, changes: { 'winner_id' => [nil, match.player1_id] }))
  end

  it 'accepts match update messages for previously tied matches' do
    match = create(:match)
    expect(subscriber).to accept(Match::UpdateMessage.new(match:, changes: { 'draw' => [false, true] }))
  end

  it 'does not accept match update messages for incomplete matches' do
    match = create(:match)
    expect(subscriber).not_to accept(Match::UpdateMessage.new(match:, changes: {}))
  end

  it 'accepts match destroy messages for completed matches' do
    match = create(:match, :with_winner)
    expect(subscriber).to accept(Match::DestroyMessage.new(match:))
  end

  it 'does not accept match destroy messages for incomplete matches' do
    match = create(:match)
    expect(subscriber).not_to accept(Match::DestroyMessage.new(match:))
  end

  describe '#perform' do
    subject(:perform) { subscriber.perform }

    let(:subscriber) { described_class.new(message) }
    let(:message) { Match::UpdateMessage.new(match:, changes: {}) }
    let(:match) { create(:match, :with_winner) }

    it 'updates the player statistics of the winner' do
      expect { perform }.to change { match.winner.reload.wins_count }.from(0).to(1)
    end

    it 'updates the player statistics of the loser' do
      expect { perform }.to change { match.loser.reload.losses_count }.from(0).to(1)
    end

    it 'updates the completed matches count of both players' do
      expect { perform }.to change { match.player1.reload.completed_matches_count }.by(1)
        .and change { match.player2.reload.completed_matches_count }.by(1)
    end

    context 'when the match is a draw' do
      let(:match) { create(:match, :draw) }

      it 'updates the draws count of both players' do
        expect { perform }.to change { match.player1.reload.draws_count }.by(1)
          .and change { match.player2.reload.draws_count }.by(1)
      end

      it 'updates the completed matches count of both players' do
        expect { perform }.to change { match.player1.reload.completed_matches_count }.by(1)
          .and change { match.player2.reload.completed_matches_count }.by(1)
      end
    end

    context 'when one if the players is replaced' do
      let(:message) { Match::UpdateMessage.new(match:, changes: { 'player1_id' => [new_player.id, old_player.id] }) }
      let(:match) { create(:match, :draw) }
      let!(:new_player) { create(:player, event: match.event) }
      let!(:old_player) { match.player1 }

      before(:each) do
        old_player.calculate_statistics!
        match.update!(player1: new_player)
      end

      it 'updates the draws count of the new player' do
        expect { perform }.to change { new_player.reload.draws_count }.by(1)
      end

      it 'removes the draws count of the old player' do
        expect { perform }.to change { old_player.reload.draws_count }.by(-1)
      end

      it 'updates the completed matches count of the new player' do
        expect { perform }.to change { new_player.reload.completed_matches_count }.by(1)
      end

      it 'removes the completed matches count of the old player' do
        expect { perform }.to change { old_player.reload.completed_matches_count }.by(-1)
      end
    end
  end
end
