# frozen_string_literal: true

module Types
  class TimerCreateInputType < BaseInputObject
    argument :round_id, ID, required: true
    argument :preset_id, ID, required: true
    argument :label, String, required: false
  end
end
