# frozen_string_literal: true

module Types
  class RoundType < Types::BaseObject
    field :id, ID, null: false
    field :event_id, ID, null: false
    field :number, Integer, null: false
    field :is_complete, Boolean, null: false, resolver_method: :complete? do
      description 'Whether all matches have been played (must include at least one match)'
    end

    field :matches, [Types::MatchType], null: false
    field :players, [Types::PlayerType], null: false do
      extension Extensions::DeletedFilterExtension
      extension Extensions::Players::ActiveOnlyExtension
    end
    field :unpaired_players, [Types::PlayerType], null: false do
      extension Extensions::DeletedFilterExtension
      extension Extensions::Players::ActiveOnlyExtension
    end

    field :primary_timer, Types::TimerType, null: true do
      description 'The primary timer for the round'
    end

    field :timers, [Types::TimerType], null: false do
      argument :limit, Integer, required: false do
        description 'The maximum number of timers to return (default: no limit)'
      end
      argument :include_expired, Boolean, required: false, default_value: true do
        description 'Whether to include expired timers'
      end
      argument :include_match_timers, Boolean, required: false, default_value: true do
        description 'Whether to include match-specific timers'
      end
    end

    # @return [Boolean]
    def complete?
      matches.present? && matches.all?(&:complete?)
    end

    # @return [Array<::Match>]
    def matches
      scope = Match.paired_first.order(:table, :created_at)

      dataloader.with(Sources::RecordList, ::Match, :round_id, scope:).load(object.id)
    end

    # @param deleted [Proc]
    # @param active_only [Boolean]
    # @return [Array<::Player>]
    def players(deleted:, active_only: false)
      players = Player.all
      players = deleted.call(players)
      players = players.active if active_only

      dataloader.with(Sources::Record, ::Player, scope: players).load_all(player_ids).compact
    end

    # @param deleted [Proc]
    # @param active_only [Boolean]
    # @return [Array<::Player>]
    def unpaired_players(deleted:, active_only: false)
      players = Player.all
      players = deleted.call(players)
      players = players.active if active_only
      players = players.where.not(id: player_ids)

      dataloader.with(Sources::RecordList, ::Player, :event_id, scope: players).load(object.event_id)
    end

    # @return [::Timer, nil]
    def primary_timer
      dataloader.with(Sources::Record, ::Timer, :round_id, scope: ::Timer.primary).load(object.id)
    end

    # @param limit [Integer, nil]
    # @param include_expired [Boolean]
    # @param include_match_timers [Boolean]
    # @return [Array<::Timer>]
    def timers(limit: nil, include_expired: true, include_match_timers: true)
      scope = ::Timer.all
      scope = scope.not_expired unless include_expired
      scope = scope.where(match: nil) unless include_match_timers

      timers = dataloader.with(Sources::RecordList, ::Timer, :round_id, scope:).load(object.id)
      timers = timers.first(limit) if limit

      timers
    end

  private

    # @return [Array<String>]
    def player_ids
      @player_ids ||= matches.flat_map(&:player_ids).compact.uniq
    end
  end
end
