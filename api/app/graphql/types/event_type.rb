# frozen_string_literal: true

module Types
  class EventType < BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    field :players, Types::PlayerConnectionType, null: false do
      argument :deleted, Boolean, required: false do
        description 'Filters players by their deletion state; includes all players if unspecified'
      end
    end
    field :rounds, [Types::RoundType], null: false

    # @param deleted [Boolean, nil]
    # @return [Array<::Player>]
    def players(deleted: nil)
      players = Player.order(:name, :id)
      players = deleted ? players.deleted : players.non_deleted unless deleted.nil?

      dataloader.with(Sources::RecordList, ::Player, :event_id, scope: players).load(object.id)
    end

    # @return [Array<::Round>]
    def rounds
      dataloader.with(Sources::RecordList, ::Round, :event_id, scope: Round.order(:number)).load(object.id)
    end
  end
end
