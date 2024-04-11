# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mutations::RoundCreate do
  let(:resolve) { EquineEventApiSchema.execute(<<~GQL, context:, variables:) }
    mutation RoundCreate($input: RoundCreateInput!) {
      roundCreate(input: $input) {
        round {
          __typename
          id
          eventId
          number
          matches {
            player1Id
            player2Id
          }
        }
        errors {
          attribute
          message
        }
      }
    }
  GQL
  let(:context) { build(:graphql_context) }
  let(:variables) { { input: } }
  let(:input) { graphql_input(:round_create_input, event:) }
  let(:event) { create(:swiss_event, :with_players) }

  it 'creates a new round' do
    expect { resolve }.to change { Round.count }.by(1)
  end

  it 'returns the new round', :aggregate_failures do
    expect(resolve.dig('data', 'roundCreate', 'round', '__typename')).to eq('Round')
    expect(resolve.dig('data', 'roundCreate', 'round', 'eventId')).to eq(event.id)
    expect(resolve.dig('data', 'roundCreate', 'round', 'number')).to eq(1)
  end

  it 'pairs all active players', :aggregate_failures do
    player_ids = resolve.dig('data', 'roundCreate', 'round', 'matches')
      .flat_map { |match| [match['player1Id'], match['player2Id']] }
    expect(player_ids).to be_present
    expect(player_ids.compact).to match_array(event.players.active.ids)
  end

  context 'when the event has a current round' do
    before(:each) do
      create(:round, event:)
    end

    it 'does not create a new round' do
      expect { resolve }.not_to change { Round.count }
    end

    it 'returns an error', :aggregate_failures do
      expect(resolve.dig('data', 'roundCreate', 'errors')).to contain_exactly(
        hash_including(
          'attribute' => 'base',
          'message'   => 'Cannot add a new round until the current round is complete'
        )
      )
    end
  end

  context 'when the event has a current round that is complete' do
    before(:each) do
      create(:round, :complete, event:)
    end

    it 'creates a new round' do
      expect { resolve }.to change { Round.count }.by(1)
    end
  end

  context 'when the event is a single-elimination event' do
    let(:event) { create(:single_elimination_event, :with_players) }

    it 'creates a new round' do
      expect { resolve }.to change { Round.count }.by(1)
    end

    it 'returns the new round', :aggregate_failures do
      expect(resolve.dig('data', 'roundCreate', 'round', '__typename')).to eq('Round')
      expect(resolve.dig('data', 'roundCreate', 'round', 'eventId')).to eq(event.id)
      expect(resolve.dig('data', 'roundCreate', 'round', 'number')).to eq(1)
    end

    it 'pairs all active players', :aggregate_failures do
      player_ids = resolve.dig('data', 'roundCreate', 'round', 'matches')
        .flat_map { |match| [match['player1Id'], match['player2Id']] }
      expect(player_ids).to be_present
      expect(player_ids).to match_array(event.players.active.ids)
    end
  end
end
