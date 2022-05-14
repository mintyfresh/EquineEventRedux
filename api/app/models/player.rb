# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  name       :citext           not null
#  paid       :boolean          default(FALSE), not null
#  dropped    :boolean          default(FALSE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
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
class Player < ApplicationRecord
  include SoftDeletable

  belongs_to :event, inverse_of: :players

  has_one :score_card, class_name: 'PlayerScoreCard', dependent: false, inverse_of: :player

  validates :name, length: { maximum: 50 }, presence: true, uniqueness: { scope: :event }

  scope :active, -> { non_deleted.where(paid: true, dropped: false) }

  # @return [Boolean]
  def active?
    !deleted? && paid? && !dropped?
  end
end
