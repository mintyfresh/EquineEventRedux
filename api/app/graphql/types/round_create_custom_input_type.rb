# frozen_string_literal: true

module Types
  class RoundCreateCustomInputType < BaseInputObject
    argument :event_id, ID, required: true, loads: Types::EventType
    argument :matches, [MatchInputType], required: false, as: :matches_attributes

    # @param event_id [String]
    # @return [::Event]
    def self.load_event(event_id, context)
      context.dataloader.with(Sources::Record, ::Event).load(event_id)
    end
  end
end
