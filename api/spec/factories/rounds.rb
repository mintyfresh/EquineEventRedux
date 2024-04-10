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
FactoryBot.define do
  factory :round do
    event factory: :swiss_event

    number { event.rounds.size + 1 }

    trait :with_matches do
      transient do
        matches_count { 3 }
      end

      matches { build_list(:match, matches_count, event:, round: instance) }
    end

    trait :with_timers do
      transient do
        timers_count { 3 }
      end

      timers { build_list(:timer, timers_count, round: instance) }
    end
  end
end
