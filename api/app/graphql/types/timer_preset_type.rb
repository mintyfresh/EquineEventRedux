# frozen_string_literal: true

module Types
  class TimerPresetType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :is_system, Boolean, null: false, method: :system? do
      description 'Whether this timer preset is system-defined'
    end
    field :phases_count, Integer, null: false
    field :total_duration, Types::ISO8601DurationType, null: false
    field :total_duration_humanized, String, null: false do
      description 'The total duration, formatted as a human-readable string'
    end
    field :total_duration_in_seconds, Integer, null: false
    field :phases, [Types::TimerPresetPhaseType], null: false do
      argument :limit, Integer, required: false do
        description 'If specified, the first N phases will be returned'
      end
    end

    # @return [ActiveSupport::Duration]
    def total_duration
      @total_duration ||= timer_preset_phases.filter_map(&:duration).sum(0.seconds)
    end

    # @return [String]
    def total_duration_humanized
      total_duration.inspect
    end

    # @return [Integer]
    def total_duration_in_seconds
      timer_preset_phases.filter_map(&:duration_in_seconds).sum
    end

    # @param limit [Integer, nil]
    # @return [Array<::TimerPresetPhase>]
    def phases(limit: nil)
      phases = timer_preset_phases
      phases = phases.first(limit) if limit

      phases
    end

  private

    # @return [Array<::TimerPresetPhase>]
    def timer_preset_phases
      @timer_preset_phases ||= begin
        scope = ::TimerPresetPhase.ordered # order phases by position, tie-breaker on ID
        dataloader.with(Sources::RecordList, ::TimerPresetPhase, :timer_preset_id, scope:).load(object.id)
      end
    end
  end
end
