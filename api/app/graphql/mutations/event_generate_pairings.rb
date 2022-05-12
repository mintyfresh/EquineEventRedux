# frozen_string_literal: true

module Mutations
  class EventGeneratePairings < BaseMutation
    description 'Generates a possible list of pairings for a round.'

    field :pairings, [Types::PairingType], null: false

    argument :event_id, ID, required: true
    argument :player_ids, [ID], required: true do
      description 'Players for which pairings should be generated.'
    end

    def resolve(event_id:, player_ids:)
      event   = ::Event.find(event_id)
      players = event.players.active.find(player_ids)

      weighted_edges = generated_weighted_edges(players.shuffle)
      graph = GraphMatching::Graph::WeightedGraph[*weighted_edges]

      pairings = graph.maximum_weighted_matching(true).edges.map do |(player1, player2)|
        { player1: players[player1], player2: players[player2] }
      end

      { pairings: }
    end

  private

    # @param players [Array<::Player>]
    # @return [Array<(Integer, Integer, Numeric)>]
    def generated_weighted_edges(players)
      players = [*players, nil] if players.count.odd?

      players.combination(2).map do |player1, player2|
        [players.index(player1), players.index(player2), pairing_weight(player1, player2)]
      end
    end

    # @param player1 [::Player]
    # @param player2 [::Player, nil]
    # @return [Numeric]
    def pairing_weight(player1, player2)
      return -9_999_999 if player1.score_card.opponent_ids.include?(player2&.id)

      player1_score = player1 ? player1.score_card.score : 0
      player2_score = player2 ? player2.score_card.score : 0

      min = [player1_score, player2_score].min
      max = [player1_score, player2_score].max

      ((max + min) / 2.0) - ((max - min)**2)
    end
  end
end
