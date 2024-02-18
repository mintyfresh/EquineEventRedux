# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Match::UpdatePlayerScoresSubscriber, type: :subscriber do
  subject(:subscriber) { described_class }

  pending 'accepts some message' do
    expect(subscriber).to accept(SomeMessage) # TODO: Replace with your message classes
  end

  describe '#perform' do
    subject(:perform) { subscriber.perform }

    let(:subscriber) { described_class.new(message) }
    let(:message) { nil } # TODO: Build a message

    pending 'does something useful' do
      perform
      expect(true).to eq(false)
    end
  end
end
