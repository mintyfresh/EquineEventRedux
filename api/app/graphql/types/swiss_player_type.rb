# frozen_string_literal: true

module Types
  class SwissPlayerType < BaseObject
    implements PlayerType

    field :draws_count, Integer, null: false
    field :score, Integer, null: false
    field :maximum_possible_score, Integer, null: false
  end
end
