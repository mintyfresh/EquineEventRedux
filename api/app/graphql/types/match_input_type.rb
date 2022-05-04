# frozen_string_literal: true

module Types
  class MatchInputType < BaseInputObject
    argument :winner_id, ID, required: false
    argument :draw, Boolean, required: false, default_value: false, replace_null_with_default: true
  end
end
