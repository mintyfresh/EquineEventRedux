# frozen_string_literal: true

module Types
  module TimerPhaseableType
    include Types::BaseInterface

    field :id, ID, null: false
    field :name, String, null: false
    field :position, Integer, null: false
    field :duration_amount, Integer, null: false
    field :duration_unit, Types::TimerPhaseDurationUnitType, null: false
    field :duration, Types::ISO8601DurationType, null: false
    field :duration_humanized, String, null: false
    field :duration_in_seconds, Integer, null: false
    field :offset_from_start, Integer, null: false do
      description 'The number of seconds from the start of the timer to the start of this phase (before this phase)'
    end
    field :offset_from_end, Integer, null: false do
      description 'The number of seconds from the end of this phase to the end of the timer (after this phase)'
    end
    field :audio_clip, Types::AudioClipType, null: true

    # @return [String]
    def duration_humanized
      object.duration.inspect
    end

    # @return [::AudioClip, nil]
    def audio_clip
      object.audio_clip_id && dataloader.with(Sources::Record, ::AudioClip).load(object.audio_clip_id)
    end
  end
end
