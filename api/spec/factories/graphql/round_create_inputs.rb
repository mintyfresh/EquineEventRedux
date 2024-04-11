# frozen_string_literal: true

FactoryBot.define do
  factory :round_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    event_id { event.id }

    transient do
      event { create(:swiss_event) }
    end
  end
end
