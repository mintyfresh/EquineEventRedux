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
    field :total_duration_in_seconds, Integer, null: false
    field :phases, [Types::TimerPresetPhaseType], null: false

    # @return [ActiveSupport::Duration]
    def total_duration
      phases.filter_map(&:duration).sum(0.seconds)
    end

    # @return [Integer]
    def total_duration_in_seconds
      phases.filter_map(&:duration_in_seconds).sum
    end

    # @return [Array<::TimerPresetPhase>]
    def phases
      @phases ||= begin
        scope = ::TimerPresetPhase.ordered # order phases by position, tie-breaker on ID
        dataloader.with(Sources::RecordList, ::TimerPresetPhase, :timer_preset_id, scope:).load(object.id)
      end
    end
  end
end
