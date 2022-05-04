# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player_ids :uuid             not null, is an Array
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_matches_on_round_id  (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (round_id => rounds.id)
#
FactoryBot.define do
  factory :match do
    association :round, strategy: :create

    player_ids { players.map(&:id) }

    transient do
      players { create_list(:player, 2, event: round.event) }
    end

    trait :with_winner do
      winner_id { player_ids.sample }
    end

    after(:build) do |match, e|
      match.round.event.players += e.players
    end
  end
end
