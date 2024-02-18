# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#  slug       :string           not null
#
# Indexes
#
#  index_events_on_name  (name) UNIQUE WHERE (deleted_at IS NULL)
#  index_events_on_slug  (slug) UNIQUE WHERE (deleted_at IS NULL)
#
class Event < ApplicationRecord
  include SoftDeletable

  has_unique_attribute :name
  has_unique_attribute :name, index: 'index_events_on_slug'

  has_many :players, dependent: :destroy, inverse_of: :event
  has_many :rounds, dependent: :destroy, inverse_of: :event
  has_many :timers, dependent: :destroy, inverse_of: :event

  validates :name, length: { maximum: 50 }, presence: true
  validates :name, uniqueness: { condition: -> { non_deleted }, if: :name_changed? }

  strips_whitespace_from :name

  before_save if: :name_changed? do
    self.slug = name.parameterize
  end

  # @return [Integer]
  def next_round_number
    (rounds.non_deleted.maximum(:number) || 0) + 1
  end

  # @return [Round, nil]
  def current_round
    rounds.non_deleted.order(:number).last
  end
end
