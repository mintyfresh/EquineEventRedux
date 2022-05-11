# frozen_string_literal: true

module Types
  class MatchType < Types::BaseObject
    implements GraphQL::Types::Relay::Node

    field :winner_id, ID do
      description 'The ID of the winner of the match.'
    end
    field :draw, Boolean, null: false

    field :player1, Types::PlayerType, null: false
    field :player2, Types::PlayerType, null: true

    # @return [String, nil]
    def winner_id
      case object.winner_id
      when nil then nil
      when object.player1_id then EquineEventApiSchema.id_from_object(player1, Types::PlayerType, context)
      when object.player2_id then EquineEventApiSchema.id_from_object(player2, Types::PlayerType, context)
      end
    end

    # @return [::Player]
    def player1
      dataloader.with(Sources::Record, ::Player).load(object.player1_id)
    end

    # @return [::Player, nil]
    def player2
      dataloader.with(Sources::Record, ::Player).load(object.player2_id) if object.player2_id
    end
  end
end
