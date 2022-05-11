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

    field :round_create, mutation: Mutations::RoundCreate
    field :round_update_pairings, mutation: Mutations::RoundUpdatePairings
    field :round_delete, mutation: Mutations::RoundDelete
  end
end
