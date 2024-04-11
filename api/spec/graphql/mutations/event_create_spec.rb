# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mutations::EventCreate do
  let(:resolve) { EquineEventApiSchema.execute(query, context:, variables:) }
  let(:query) { <<~GQL }
    mutation EventCreate($input: EventCreateInput!) {
      eventCreate(input: $input) {
        event {
          __typename
          id
          name
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
  let(:input) { graphql_input(:event_create_input, :swiss) }

  it 'creates a new swiss event' do
    expect { resolve }.to change { SwissEvent.count }.by(1)
  end

  it 'returns the new swiss event', :aggregate_failures do
    expect(resolve.dig('data', 'eventCreate', 'event', '__typename')).to eq('SwissEvent')
    expect(resolve.dig('data', 'eventCreate', 'event', 'name')).to eq(input.dig('swiss', 'name'))
  end

  context 'when the event is a top-cut event' do
    let(:input) { graphql_input(:event_create_input, :top_cut) }

    it 'creates a new top-cut event' do
      expect { resolve }.to change { TopCutEvent.count }.by(1)
    end

    it 'returns the new top-cut event', :aggregate_failures do
      expect(resolve.dig('data', 'eventCreate', 'event', '__typename')).to eq('TopCutEvent')
      expect(resolve.dig('data', 'eventCreate', 'event', 'name')).to eq(input.dig('topCut', 'name'))
    end
  end
end
