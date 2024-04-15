# frozen_string_literal: true

module Types
  class SingleEliminationPlayerType < BaseObject
    implements PlayerType

    field :swiss_ranking, Integer, null: false
  end
end
