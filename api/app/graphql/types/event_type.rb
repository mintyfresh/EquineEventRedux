# frozen_string_literal: true

module Types
  class EventType < BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    field :players, Types::PlayerConnectionType, null: false do
      extension Extensions::DeletedFilterExtension
      extension Extensions::OrderByExtension, type: Types::EventPlayersOrderByType

      argument :active_only, Boolean, required: false, default_value: false do
        description 'If true, unpaid and dropped players will be excluded'
      end
    end
    field :rounds, [Types::RoundType], null: false do
      extension Extensions::DeletedFilterExtension
      extension Extensions::OrderByExtension, type: Types::EventRoundsOrderByType
    end

    # @param deleted [Proc]
    # @param order_by [ActiveRecord::Relation]
    # @param active_only [Boolean]
    # @return [Array<::Player>]
    def players(deleted:, order_by:, active_only: false)
      players = Player.all
      players = players.active if active_only
      players = deleted.call(players)
      players = players.merge(order_by)

      dataloader.with(Sources::RecordList, ::Player, :event_id, scope: players).load(object.id)
    end

    # @param deleted [Proc]
    # @param order_by [ActiveRecord::Relation]
    # @return [Array<::Round>]
    def rounds(deleted:, order_by:)
      rounds = Round.all
      rounds = deleted.call(rounds)
      rounds = rounds.merge(order_by)

      dataloader.with(Sources::RecordList, ::Round, :event_id, scope: rounds).load(object.id)
    end
  end
end
