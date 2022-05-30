# frozen_string_literal: true

# == Schema Information
#
# Table name: rounds
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  number     :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#
# Indexes
#
#  index_rounds_on_event_id             (event_id)
#  index_rounds_on_event_id_and_number  (event_id,number) UNIQUE WHERE (deleted_at IS NULL)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class Round < ApplicationRecord
  include SoftDeletable

  belongs_to :event, inverse_of: :rounds

  has_many :matches, dependent: :destroy, inverse_of: :round

  accepts_nested_attributes_for :matches, allow_destroy: true, reject_if: :all_blank

  before_create do
    self.number = (event.rounds.maximum(:number) || 0) + 1
  end
end
