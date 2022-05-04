# frozen_string_literal: true

module Types
  class RoundType < Types::BaseObject
    field :id, ID, null: false
    field :event_id, ID, null: false
    field :number, Integer, null: false
    field :matches, [Types::MatchType], null: false

    # @return [Array<::Match>]
    def matches
      dataloader.with(Sources::RecordList, ::Match, :round_id).load(object.id)
    end
  end
end
