# frozen_string_literal: true

module Mutations
  class PlayerImportBulk < BaseMutation
    argument :input, Types::PlayerImportBulkInputType, required: true

    field :event, Types::EventType, null: true
    field :players, [Types::PlayerType], null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(input:)
      input.event.with_lock do
        players = input.player_names.map do |name|
          prepare_player_for_import(input.event, name, input.paid)
        end

        if input.event.save
          { event: input.event, players: }
        else
          { errors: input.event.errors }
        end
      end
    end

  private

    # Prepares a Player object to be imported into the target event.
    # If a player with the name already exists, undelete them and update their paid status.
    #
    # @param event [Event]
    # @param name [String]
    # @param paid [Boolean]
    # @return [Player]
    def prepare_player_for_import(event, name, paid)
      player = event.players.find_or_initialize_by(name:)

      player.paid  ||= paid
      player.deleted = false

      player
    end
  end
end
