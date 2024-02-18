# frozen_string_literal: true

module Types
  class TimerCreateInput < BaseInputObject
    argument :event_id, ID, required: true
    argument :preset_id, ID, required: true
    argument :label, String, required: false
  end
end
