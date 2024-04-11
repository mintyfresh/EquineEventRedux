# frozen_string_literal: true

module Types
  class EventUpdateInputType < BaseInputObject
    argument :name, String, required: false
  end
end
