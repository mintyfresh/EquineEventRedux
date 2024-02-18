# frozen_string_literal: true

module Types
  class TimerUpdateInput < BaseInputObject
    argument :label, String, required: false
  end
end
