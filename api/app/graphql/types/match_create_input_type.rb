# frozen_string_literal: true

module Types
  class MatchCreateInputType < BaseInputObject
    argument :player1_id, ID, required: true
    argument :player2_id, ID, required: false
  end
end
