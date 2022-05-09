# frozen_string_literal: true

module Types
  class PlayerConnectionType < BaseConnection
    edge_type Types::PlayerType.edge_type

    field :total_count, Integer, null: false

    def total_count
      object.nodes.count
    end
  end
end
