# frozen_string_literal: true

FactoryBot.define do
  factory :round_create_custom_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    event_id { event.id }

    transient do
      event { create(:swiss_event) }
    end

    trait :with_matches do
      matches_attributes do
        event.players.each_slice(2).map.with_index(1) do |(player1, player2), table|
          { player1_id: player1.id, player2_id: player2&.id, table: }
        end
      end

      before(:graphql_input) do |input|
        input[:matches] = input.delete(:matches_attributes)
      end
    end
  end
end
