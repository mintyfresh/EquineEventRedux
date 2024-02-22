# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :audio_clip_create, mutation: Mutations::AudioClipCreate
    field :audio_clip_delete, mutation: Mutations::AudioClipDelete

    field :event_create, mutation: Mutations::EventCreate
    field :event_update, mutation: Mutations::EventUpdate
    field :event_delete, mutation: Mutations::EventDelete
    field :event_restore, mutation: Mutations::EventRestore
    field :event_generate_pairings, mutation: Mutations::EventGeneratePairings
    field :event_pause_all_timers, mutation: Mutations::EventPauseAllTimers
    field :event_unpause_all_timers, mutation: Mutations::EventUnpauseAllTimers

    field :match_update, mutation: Mutations::MatchUpdate

    field :player_create, mutation: Mutations::PlayerCreate
    field :player_update, mutation: Mutations::PlayerUpdate
    field :player_delete, mutation: Mutations::PlayerDelete
    field :player_restore, mutation: Mutations::PlayerRestore
    field :player_import_bulk, mutation: Mutations::PlayerImportBulk

    field :round_create, mutation: Mutations::RoundCreate
    field :round_update, mutation: Mutations::RoundUpdate
    field :round_delete, mutation: Mutations::RoundDelete
    field :round_restore, mutation: Mutations::RoundRestore

    field :timer_create, mutation: Mutations::TimerCreate
    field :timer_update, mutation: Mutations::TimerUpdate
    field :timer_delete, mutation: Mutations::TimerDelete
    field :timer_pause, mutation: Mutations::TimerPause
    field :timer_unpause, mutation: Mutations::TimerUnpause
    field :timer_skip_to_next_phase, mutation: Mutations::TimerSkipToNextPhase
    field :timer_reset, mutation: Mutations::TimerReset
    field :timer_clone_with_extension, mutation: Mutations::TimerCloneWithExtension

    field :timer_preset_create, mutation: Mutations::TimerPresetCreate
    field :timer_preset_update, mutation: Mutations::TimerPresetUpdate
    field :timer_preset_delete, mutation: Mutations::TimerPresetDelete
  end
end
