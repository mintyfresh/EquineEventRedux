# frozen_string_literal: true

module Types
  class TimerType < BaseObject
    field :id, ID, null: false
    field :round_id, ID, null: false
    field :match_id, ID, null: true

    field :label, String, null: true
    field :is_primary, Boolean, null: false, method: :primary? do
      description 'Whether this timer is the primary timer for the round'
    end
    field :expires_at, GraphQL::Types::ISO8601DateTime, null: false
    field :is_expired, Boolean, null: false, resolver_method: :expired?
    field :paused_at, GraphQL::Types::ISO8601DateTime, null: true
    field :is_paused, Boolean, null: false, method: :paused?

    field :total_duration, Types::ISO8601DurationType, null: false do
      description 'The total duration of the timer'
    end
    field :total_duration_in_seconds, Integer, null: false do
      description 'The total duration of the timer, in seconds'
    end
    field :instant, GraphQL::Types::ISO8601DateTime, null: false do
      description 'The local current time when the query was executed, to which all other times are relative'
    end
    field :time_elapsed, Float, null: false do
      description 'The amount of time that has elapsed since the timer started, in seconds'
    end
    field :time_remaining, Float, null: false do
      description 'The amount of time remaining in the current phase, in seconds'
    end
    field :time_remaining_in_phase, Float, null: false do
      description 'The amount of time remaining in the current phase, in seconds'
    end

    field :preset, Types::TimerPresetType, null: false
    field :phases, [Types::TimerPhaseType], null: false

    # @return [Time]
    def instant
      @instant ||= Time.current
    end

    # @return [Boolean]
    def expired?
      object.expired?(instant)
    end

    # @return [ActiveSupport::Duration]
    def total_duration
      phases # ensure phases are loaded

      object.total_duration
    end

    # @return [Integer]
    def total_duration_in_seconds
      phases # ensure phases are loaded

      object.total_duration_in_seconds
    end

    # @return [Float]
    def time_remaining
      object.time_remaining(instant)
    end

    # @return [Float]
    def time_remaining_in_phase
      phases # ensure phases are loaded

      object.time_remaining_in_phase(instant)
    end

    # @return [::TimerPreset]
    def preset
      dataloader.with(Sources::Record, ::TimerPreset).load(object.preset_id)
    end

    # @return [Array<::TimerPhase>]
    def phases
      dataloader.with(Sources::Association, ::Timer, :phases).load(object)
    end
  end
end
