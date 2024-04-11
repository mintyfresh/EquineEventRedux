# frozen_string_literal: true

module Types
  class TopCutEventType < BaseObject
    implements Types::EventType

    field :swiss_event_id, ID, null: false
    field :swiss_event, Types::SwissEventType, null: false
    field :players_count, Integer, null: false
  end
end
