# frozen_string_literal: true

module Types
  class PlayerInputType < BaseInputObject
    argument :name, String, required: false
    argument :paid, Boolean, required: false
    argument :dropped, Boolean, required: false
  end
end
