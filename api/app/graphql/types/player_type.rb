# frozen_string_literal: true

module Types
  class PlayerType < BaseObject
    field :id, ID, null: false
    field :event_id, ID, null: false
    field :name, String, null: false
    field :paid, Boolean, null: false
    field :dropped, Boolean, null: false
    field :deleted, Boolean, null: false
    field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true

    field :wins_count, Integer, null: false
    field :draws_count, Integer, null: false
    field :losses_count, Integer, null: false
    field :score, Integer, null: false

    # @return [Integer]
    def wins_count
      @wins_count ||= matches.count { |match| match.winner_id == object.id }
    end

    # @return [Integer]
    def draws_count
      @draws_count ||= matches.count(&:draw?)
    end

    # @return [Integer]
    def losses_count
      @losses_count ||= matches.count { |match| match.winner_id && match.winner_id != object.id }
    end

    # @return [Integer]
    def score
      (wins_count * 3) + (draws_count * 1) + (losses_count * 0)
    end

  private

    # @return [Array<::Match>]
    def matches
      @matches ||= dataloader.with(Sources::RecordList, ::Round, :event_id).load(object.event_id).flat_map do |round|
        dataloader.with(Sources::RecordList, ::Match, :round_id).load(round.id).select do |match|
          match.player_ids.include?(object.id)
        end
      end
    end
  end
end
