# frozen_string_literal: true

module Types
  class EventInputType < BaseInputObject
    argument :name, String, required: false
  end
end
