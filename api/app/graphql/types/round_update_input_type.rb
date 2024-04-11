# frozen_string_literal: true

module Types
  class RoundUpdateInputType < BaseInputObject
    argument :matches, [MatchInputType], required: false, as: :matches_attributes
  end
end
