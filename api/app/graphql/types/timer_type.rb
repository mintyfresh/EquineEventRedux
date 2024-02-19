# frozen_string_literal: true

module Types
  class TimerType < BaseObject
    field :id, ID, null: false
    field :label, String, null: true
    field :expires_at, GraphQL::Types::ISO8601DateTime, null: false
    field :is_expired, Boolean, null: false, method: :expired?
    field :paused_at, GraphQL::Types::ISO8601DateTime, null: true
    field :is_paused, Boolean, null: false, method: :paused?

    field :time_remaining, Float, null: false do
      description 'The amount of time remaining in the current phase, in seconds'
    end
    field :time_remaining_in_phase, Float, null: false do
      description 'The amount of time remaining in the current phase, in seconds'
    end

    field :preset, Types::TimerPresetType, null: false
    field :current_phase, Types::TimerPresetPhaseType, null: true
    field :previous_phase, Types::TimerPresetPhaseType, null: true
    field :next_phase, Types::TimerPresetPhaseType, null: true

    # @return [::TimerPreset]
    def preset
      dataloader.with(Sources::Record, ::TimerPreset).load(object.preset_id)
    end
  end
end
