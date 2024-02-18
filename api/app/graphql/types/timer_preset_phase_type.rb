# frozen_string_literal: true

module Types
  class TimerPresetPhaseType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :position, Integer, null: false
    field :duration_amount, Integer, null: false
    field :duration_unit, Types::TimerPhaseDurationUnitType, null: false
    field :duration, Types::ISO8601DurationType, null: false
    field :duration_in_seconds, Integer, null: false
    field :audio_clip, Types::AudioClipType, null: true

    # @return [::AudioClip, nil]
    def audio_clip
      object.audio_clip_id && dataloader.with(Sources::Record, ::AudioClip).load(object.audio_clip_id)
    end
  end
end
