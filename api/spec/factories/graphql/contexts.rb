# frozen_string_literal: true

FactoryBot.define do
  factory :graphql_context, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    host { 'http://localhost:3000' }
  end
end
