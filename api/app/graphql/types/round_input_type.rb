# frozen_string_literal: true

module Types
  class RoundInputType < BaseInputObject
    argument :matches, [MatchInputType], required: false, as: :matches_attributes
  end
end
