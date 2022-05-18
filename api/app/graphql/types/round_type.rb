# frozen_string_literal: true

module Types
  class RoundType < Types::BaseObject
    field :id, ID, null: false
    field :event_id, ID, null: false
    field :number, Integer, null: false

    field :matches, [Types::MatchType], null: false
    field :players, [Types::PlayerType], null: false do
      extension Extensions::DeletedFilterExtension
    end

    # @return [Array<::Match>]
    def matches
      scope = Match.paired_first.order(:created_at)

      dataloader.with(Sources::RecordList, ::Match, :round_id, scope:).load(object.id)
    end

    # @param deleted [Proc]
    # @return [Array<::Player>]
    def players(deleted:)
      players = Player.all
      players = deleted.call(players)

      dataloader.with(Sources::Record, ::Player, scope: players).load_all(player_ids).compact
    end

  private

    # @return [Array<String>]
    def player_ids
      @player_ids ||= matches.flat_map(&:player_ids).compact.uniq
    end
  end
end
