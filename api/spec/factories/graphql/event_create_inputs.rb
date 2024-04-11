# frozen_string_literal: true

FactoryBot.define do
  factory :event_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    trait :swiss do
      swiss { graphql_input(:swiss_event_create_input) }
    end

    trait :top_cut do
      top_cut { graphql_input(:top_cut_event_create_input) }
    end
  end
end
