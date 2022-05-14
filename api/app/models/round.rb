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

  has_many :matches, autosave: true, dependent: :destroy, inverse_of: :round

  validates :number, numericality: { greater_than: 0 }

  # @param pairings [Array<Array<String, nil>>]
  # @return [Boolean]
  def update_pairings(pairings)
    # Filter and normalize the pairings.
    pairings = pairings.compact.map do |player_ids|
      player_ids.first(2).sort_by(&PLAYER_IDS_COMPARATOR)
    end

    matches.each do |match|
      # Filter the input matches to exclude any that already exist.
      # Remove any matches that conflict with the new pairings.
      pairings.delete(match.player_ids) or match.mark_for_destruction
    end

    # Build the new matches.
    pairings.each { |player_ids| matches.build(player_ids:) }

    save
  end
end
