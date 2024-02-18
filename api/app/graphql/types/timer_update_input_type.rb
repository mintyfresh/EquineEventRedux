# frozen_string_literal: true

module Types
  class TimerUpdateInputType < BaseInputObject
    argument :label, String, required: false
  end
end
