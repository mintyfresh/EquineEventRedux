# frozen_string_literal: true

FactoryBot.define do
  factory :event_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    trait :swiss do
      swiss { graphql_input(:swiss_event_create_input) }
    end

    trait :single_elimination do
      single_elimination { graphql_input(:single_elimination_event_create_input) }
    end
  end
end
