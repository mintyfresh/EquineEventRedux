# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :event_create, mutation: Mutations::EventCreate
    field :event_update, mutation: Mutations::EventUpdate
    field :event_delete, mutation: Mutations::EventDelete
    field :event_generate_pairings, mutation: Mutations::EventGeneratePairings

    field :match_update, mutation: Mutations::MatchUpdate

    field :player_create, mutation: Mutations::PlayerCreate
    field :player_update, mutation: Mutations::PlayerUpdate
    field :player_delete, mutation: Mutations::PlayerDelete
    field :player_restore, mutation: Mutations::PlayerRestore

    field :round_create, mutation: Mutations::RoundCreate
    field :round_update, mutation: Mutations::RoundUpdate
    field :round_delete, mutation: Mutations::RoundDelete
    field :round_restore, mutation: Mutations::RoundRestore
  end
end
