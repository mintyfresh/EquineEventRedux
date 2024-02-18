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
#  deleted_in :uuid
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

  validate if: :matches_changed? do
    tables = Set.new

    matches.each_with_index do |match, index|
      next if match.marked_for_destruction?

      if tables.include?(match.table)
        error = match.errors.add(:table, :taken)
        errors.import(error, attribute: "matches[#{index}].#{error.attribute}")
      else
        tables << match.table
      end
    end
  end

  before_create do
    self.number = event.next_round_number
  end

  after_soft_delete do
    matches.each { |match| match.destroy!(deleted_in:) }
  end

  after_restore do
    matches.each { |match| match.restore! if match.deleted_in == deleted_in }
  end

  # Determine if all matches in the round are complete.
  # There must be at least one match for the round to be considered complete.
  #
  # @return [Boolean]
  def complete?
    matches.all?(&:complete?) && matches.any?
  end

  # @return [Boolean]
  def matches_changed?
    matches.target.any? do |match|
      match.new_record? || match.changed? || match.marked_for_destruction?
    end
  end
end
