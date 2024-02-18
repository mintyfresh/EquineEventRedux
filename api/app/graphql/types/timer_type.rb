# frozen_string_literal: true

module Types
  class TimerType < BaseObject
    field :id, ID, null: false
    field :label, String, null: true
    field :is_ended, Boolean, null: false, method: :ended?
    field :is_phase_expired, Boolean, null: false, method: :phase_expired?
    field :is_paused, Boolean, null: false, method: :paused?
    field :paused_at, GraphQL::Types::ISO8601DateTime, null: true

    field :time_remaining, Float, null: false do
      description 'The amount of time remaining in the current phase, in seconds'
    end

    field :preset, Types::TimerPresetType, null: false
    field :current_phase, Types::TimerPresetPhaseType, null: true
    field :previous_phase, Types::TimerPresetPhaseType, null: true

    # @return [::TimerPreset]
    def preset
      dataloader.with(Sources::Record, ::TimerPreset).load(object.preset_id)
    end

    # @return [::TimerPresetPhase, nil]
    def current_phase
      object.current_phase_id && dataloader.with(Sources::Record, ::TimerPresetPhase).load(object.current_phase_id)
    end

    # @return [::TimerPresetPhase, nil]
    def previous_phase
      object.previous_phase_id && dataloader.with(Sources::Record, ::TimerPresetPhase).load(object.previous_phase_id)
    end
  end
end
