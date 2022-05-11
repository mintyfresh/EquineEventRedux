# frozen_string_literal: true

module Types
  class RoundCreateInputType < BaseInputObject
    argument :matches, [Types::MatchCreateInputType], required: true
  end
end
