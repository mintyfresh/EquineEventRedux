# frozen_string_literal: true

module Types
  class QueryType < BaseObject
    field :audio_clip, resolver: Resolvers::AudioClip
    field :audio_clips, resolver: Resolvers::AudioClips

    field :event, resolver: Resolvers::Event
    field :events, resolver: Resolvers::Events

    field :match, resolver: Resolvers::Match

    field :player, resolver: Resolvers::Player

    field :round, resolver: Resolvers::Round

    field :timer_preset, resolver: Resolvers::TimerPreset
    field :timer_presets, resolver: Resolvers::TimerPresets
  end
end
