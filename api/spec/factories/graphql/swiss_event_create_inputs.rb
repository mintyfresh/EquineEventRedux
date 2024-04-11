# frozen_string_literal: true

FactoryBot.define do
  factory :swiss_event_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    sequence(:name) { |n| "#{Faker::Book.title.first(45)} #{n}" }
  end
end
