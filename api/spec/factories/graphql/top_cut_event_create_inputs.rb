# frozen_string_literal: true

FactoryBot.define do
  factory :top_cut_event_create_input, class: 'Hash' do
    skip_create
    initialize_with { attributes }

    sequence(:name) { |n| "#{Faker::Book.title.first(45)} #{n}" }
    swiss_event_id { swiss_event.id }
    swiss_player_ids { swiss_event.players.sample(8).map(&:id) }
    pairing_mode { TopCutEvent::PAIRING_MODES.sample }

    before(:graphql_input) do |input|
      input[:pairing_mode] = input[:pairing_mode].to_s.upcase
    end

    transient do
      swiss_event { create(:swiss_event, :with_players, players_count: 16) }
    end
  end
end
