# frozen_string_literal: true

# == Schema Information
#
# Table name: matches
#
#  id         :uuid             not null, primary key
#  round_id   :uuid             not null
#  player1_id :uuid             not null
#  player2_id :uuid
#  winner_id  :uuid
#  draw       :boolean          default(FALSE), not null
#  table      :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_matches_on_player1_id          (player1_id)
#  index_matches_on_player2_id          (player2_id)
#  index_matches_on_round_id            (round_id)
#  index_matches_on_round_id_and_table  (round_id,table) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (player1_id => players.id)
#  fk_rails_...  (player2_id => players.id)
#  fk_rails_...  (round_id => rounds.id)
#
FactoryBot.define do
  factory :match do
    round { create(:round, event:) }

    player1 { create(:player, event: round.event) }
    player2 { create(:player, event: round.event) }
    table { (round.matches.map(&:table).max || 0) + 1 }

    transient do
      event { build(:event) }
    end

    trait :with_winner do
      winner_id { [player1, player2].compact.sample.id }
    end
  end
end
