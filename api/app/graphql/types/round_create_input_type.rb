# frozen_string_literal: true

module Types
  class RoundCreateInputType < BaseInputObject
    argument :event_id, ID, required: true, loads: Types::EventType

    # @param event_id [String]
    # @return [::Event]
    def self.load_event(event_id, context)
      context.dataloader.with(Sources::Record, ::Event).load(event_id)
    end
  end
end
