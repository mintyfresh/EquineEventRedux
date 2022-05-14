# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Event < ApplicationRecord
  has_many :players, dependent: :destroy, inverse_of: :event
  has_many :rounds, dependent: :destroy, inverse_of: :event

  validates :name, length: { maximum: 50 }, presence: true

  # @return [Integer]
  def next_round_number
    (rounds.non_deleted.maximum(:number) || 0) + 1
  end
end
