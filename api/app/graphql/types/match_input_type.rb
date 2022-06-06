# frozen_string_literal: true

module Types
  class MatchInputType < BaseInputObject
    argument :id, ID, required: false
    argument :_destroy, Boolean, required: false
    argument :player1_id, ID, required: true
    argument :player2_id, ID, required: false
    argument :table, Integer, required: true
  end
end
