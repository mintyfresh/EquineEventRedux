# frozen_string_literal: true

module Types
  class EventType < BaseObject
    field :id, ID, null: false
    field :slug, String, null: false
    field :name, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :deleted, Boolean, null: false
    field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true

    field :players, Types::PlayerConnectionType, null: false do
      extension Extensions::DeletedFilterExtension
      extension Extensions::Players::ActiveOnlyExtension
      extension GraphQL::OrderBy::Extension, type: EventPlayersOrderByType
    end
    field :rounds, [Types::RoundType], null: false do
      extension Extensions::DeletedFilterExtension
      extension GraphQL::OrderBy::Extension, type: EventRoundsOrderByType
    end
    field :current_round, Types::RoundType, null: true
    field :timers, [Types::TimerType], null: false

    # @param deleted [Proc]
    # @param order_by_scope [ActiveRecord::Relation]
    # @param active_only [Boolean]
    # @return [Array<::Player>]
    def players(deleted:, order_by_scope:, active_only: false)
      players = Player.all
      players = players.active if active_only
      players = deleted.call(players)
      players = players.merge(order_by_scope)

      dataloader.with(Sources::RecordList, ::Player, :event_id, scope: players).load(object.id)
    end

    # @param deleted [Proc]
    # @param order_by_scope [ActiveRecord::Relation]
    # @return [Array<::Round>]
    def rounds(deleted:, order_by_scope:)
      rounds = Round.all
      rounds = deleted.call(rounds)
      rounds = rounds.merge(order_by_scope)

      dataloader.with(Sources::RecordList, ::Round, :event_id, scope: rounds).load(object.id)
    end

    # @return [::Round, nil]
    def current_round
      scope = ::Round.non_deleted.active
      dataloader.with(Sources::RecordList, ::Round, :event_id, scope:).load(object.id).max_by(&:number)
    end

    def timers
      dataloader.with(Sources::RecordList, ::Timer, :event_id).load(object.id)
    end
  end
end
