# frozen_string_literal: true

module Types
  class PlayerCreateInputType < BaseInputObject
    argument :event_id, ID, required: true, loads: Types::EventType
    argument :name, String, required: true
    argument :paid, Boolean, required: false
    argument :dropped, Boolean, required: false

    def self.load_event(event_id, context)
      context.dataloader.with(Sources::Record, ::Event).load(event_id)
    end
  end
end
