# frozen_string_literal: true

class PlayerPairingService
  PREVIOUSLY_PAIRED_PENALTY = -9_999_999

  # @param players [Array<Player>]
  # @return [Array<(Player, (Player, nil))>]
  def generate_pairings(players)
    weighted_edges = generated_weighted_edges(players.shuffle)

    graph = GraphMatching::Graph::WeightedGraph[*weighted_edges]
    edges = graph.maximum_weighted_matching(true).edges

    edges.map do |(player1, player2)|
      # Resolve players from the indices
      # The placeholder player is indexed beyond the end of this array so it becomes nil
      pairing = [players[player1], players[player2]]
      pairing = pairing.reverse if pairing.first.nil?

      pairing
    end
  end

private

  # @param players [Array<Player>]
  # @return [Array<(Integer, Integer, Numeric)>]
  def generated_weighted_edges(players)
    # Append a placeholder if the number of players is odd
    players = [*players, nil] if players.count.odd?

    players.combination(2).map do |player1, player2|
      # Use indices into the array because the graph-matching library expects numeric edges
      [players.index(player1), players.index(player2), calculate_weight_for_pairing(player1, player2)]
    end
  end

  # @param player1 [Player]
  # @param player2 [Player, nil]
  # @return [Numeric]
  def calculate_weight_for_pairing(player1, player2)
    return PREVIOUSLY_PAIRED_PENALTY if player1.score_card.opponent_ids.include?(player2&.id)

    player1_score = player1 ? player1.score_card.score : 0
    player2_score = player2 ? player2.score_card.score : 0

    min = [player1_score, player2_score].min
    max = [player1_score, player2_score].max

    ((max + min) / 2.0) - ((max - min)**2)
  end
end
