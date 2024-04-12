# frozen_string_literal: true

FactoryBot.define do
  factory :single_elimination_event_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    sequence(:name) { |n| "#{Faker::Book.title.first(45)} #{n}" }
    pairing_mode { SingleEliminationEvent::PAIRING_MODES.sample }

    before(:graphql_input) do |input|
      input[:pairing_mode] = input[:pairing_mode].to_s.upcase
    end
  end
end
