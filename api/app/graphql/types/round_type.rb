# frozen_string_literal: true

module Types
  class RoundType < Types::BaseObject
    implements GraphQL::Types::Relay::Node

    field :number, Integer, null: false
    field :matches, [Types::MatchType], null: false

    # @return [Array<::Match>]
    def matches
      scope = Match.paired_first.order(:created_at)

      dataloader.with(Sources::RecordList, ::Match, :round_id, scope:).load(object.id)
    end
  end
end
