# frozen_string_literal: true

module Types
  class PlayerImportBulkInputType < BaseInputObject
    argument :event_id, ID, required: true
    argument :player_names, [String], required: true
    argument :paid, Boolean, required: false, default_value: true

    # @return [Event]
    def event
      @event ||= ::Event.find(event_id)
    end
  end
end
