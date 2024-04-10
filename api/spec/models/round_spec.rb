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
#  complete   :boolean          default(FALSE), not null
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
require 'rails_helper'

RSpec.describe Round do
  subject(:round) { build(:round) }

  it 'has a valid factory' do
    expect(round).to be_valid
  end

  it 'is invalid without an event' do
    round.event = nil
    expect(round).to be_invalid
  end

  it 'sets a round number when created' do
    expect { round.save }.to change { round.number }.to(1)
  end

  it 'is invalid when two matches have the same table number' do
    round.event = create(:swiss_event)
    round.matches << build(:match, event: round.event, round:, table: 1)
    round.matches << build(:match, event: round.event, round:, table: 1)
    expect(round).to be_invalid
  end

  it 'deletes all matches when soft deleted' do
    round.save!
    matches = create_list(:match, 3, round:, event: round.event)
    round.destroy!
    expect(matches.each(&:reload)).to all be_deleted
  end

  it 'restores the matches that were deleted with the round' do
    round.save!
    matches = create_list(:match, 3, round:, event: round.event)
    round.destroy! && round.restore!
    expect(matches.each(&:reload).map(&:deleted?)).to all be(false)
  end

  it 'does not restore matches that were deleted separately' do
    round.save!
    matches = create_list(:match, 3, round:, event: round.event)
    matches.first.destroy!
    round.destroy! && round.restore!
    expect(matches.each(&:reload).map(&:deleted?)).to eq([true, false, false])
  end

  it 'automatically marks itself as complete when all matches are complete' do
    round.save!
    create_list(:match, 3, round:, event: round.event)
    round.matches.each { |match| match.draw = true }
    round.save!
    expect(round).to be_complete
  end

  it 'does not mark itself as complete when not all matches are complete' do
    round.save!
    create_list(:match, 3, round:, event: round.event)
    round.matches.first(2).each { |match| match.update!(draw: true) }
    expect(round).not_to be_complete
  end

  it 'does not mark itself as complete when it has no matches' do
    round.save!
    expect(round).not_to be_complete
  end

  it 'does not mark itself as complete when all matches are deleted' do
    round.save!
    create_list(:match, 3, round:, event: round.event)
    round.matches.each(&:destroy!)
    expect(round).not_to be_complete
  end
end
