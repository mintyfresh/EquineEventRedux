# frozen_string_literal: true

module Types
  class PlayerType < BaseObject
    implements GraphQL::Types::Relay::Node

    field :name, String, null: false
    field :paid, Boolean, null: false
    field :dropped, Boolean, null: false
    field :deleted, Boolean, null: false
    field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true

    field :wins_count, Integer, null: false
    field :draws_count, Integer, null: false
    field :losses_count, Integer, null: false
    field :score, Integer, null: false

    # @!method wins_count
    #   @return [Integer]
    # @!method draws_count
    #   @return [Integer]
    # @!method losses_count
    #   @return [Integer]
    # @!method score
    #   @return [Integer]
    delegate :wins_count, :draws_count, :losses_count, :score, to: :score_card

  private

    # @return [PlayerScoreCard]
    def score_card
      @score_card ||= dataloader.with(Sources::Record, ::PlayerScoreCard, :player_id).load(object.id)
    end
  end
end
