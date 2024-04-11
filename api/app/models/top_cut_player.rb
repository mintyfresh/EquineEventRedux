# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id                      :uuid             not null, primary key
#  event_id                :uuid             not null
#  name                    :citext           not null
#  paid                    :boolean          default(FALSE), not null
#  dropped                 :boolean          default(FALSE), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  deleted_at              :datetime
#  completed_matches_count :integer          default(0), not null
#  wins_count              :integer          default(0), not null
#  draws_count             :integer          default(0), not null
#  losses_count            :integer          default(0), not null
#  score                   :integer          default(0), not null
#  maximum_possible_score  :integer          default(0), not null
#  type                    :string           not null
#  data                    :jsonb            not null
#
# Indexes
#
#  index_players_on_event_id           (event_id)
#  index_players_on_event_id_and_name  (event_id,name) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class TopCutPlayer < Player
  store_accessor :data, :swiss_player_id, :swiss_ranking

  validates :swiss_player_id, presence: true
  validates :swiss_ranking, numericality: { only_integer: true, greater_than: 0 }

  # @return [Boolean]
  def eliminated?
    losses_count.positive?
  end
end
