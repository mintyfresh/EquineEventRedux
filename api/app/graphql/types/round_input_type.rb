# frozen_string_literal: true

module Types
  class RoundInputType < BaseInputObject
    argument :pairings, [Types::PairingInputType], required: true
  end
end
