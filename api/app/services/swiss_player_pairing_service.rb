# frozen_string_literal: true

class SwissPlayerPairingService
  PREVIOUSLY_PAIRED_PENALTY = -9_999_999

  # @param event [SwissEvent]
  def initialize(event)
    @event   = event
    @players = event.players.active.includes(:score_card).shuffle
    # Append a placeholder if the number of players is odd
    @players << nil if @players.count.odd?
  end

  # @return [Array<(SwissPlayer, (SwissPlayer, nil))>]
  def generate_pairings
    weighted_edges = generated_weighted_edges

    graph = GraphMatching::Graph::WeightedGraph[*weighted_edges]
    edges = graph.maximum_weighted_matching(true).edges

    pairings = edges.map do |(player1, player2)|
      # Resolve players from the indices
      # The placeholder player is indexed beyond the end of this array so it becomes nil
      pairing = [@players[player1], @players[player2]]
      pairing = pairing.reverse if pairing.first.nil?

      pairing
    end

    # Place the highest ranking pairings at the top of the list.
    # If a pairing has no opponent, it is placed at the bottom of the list.
    sort_pairings_by_rankings(pairings)
  end

private

  # @return [Array<(Integer, Integer, Numeric)>]
  def generated_weighted_edges
    (0...@players.length).to_a.combination(2).map do |player1_index, player2_index|
      # Use indices into the array because the graph-matching library expects numeric edges
      [player1_index, player2_index, calculate_weight_for_pairing(@players[player1_index], @players[player2_index])]
    end
  end

  # @param player1 [SwissPlayer]
  # @param player2 [SwissPlayer, nil]
  # @return [Numeric]
  def calculate_weight_for_pairing(player1, player2)
    # Apply a penalty for each time these players have been matched together.
    previous_matches_count = player1.times_matched_with(player2)
    penalty = PREVIOUSLY_PAIRED_PENALTY * previous_matches_count

    player1_score = player1 ? player1.score : 0
    player2_score = player2 ? player2.score : 0

    min = [player1_score, player2_score].min
    max = [player1_score, player2_score].max

    ((max + min) / 2.0) - ((max - min)**2) + penalty
  end

  # @param player1 [SwissPlayer]
  # @param player2 [SwissPlayer, nil]
  # @return [Array<(Numeric, Numeric)>]
  def calculate_rankings_for_pairing(player1, player2)
    return [0.0, 0.0] if player2.nil?

    [
      (player1.score + player2.score) / 2.0,
      (player1.opponent_win_rate + player2.opponent_win_rate) / 2.0
    ]
  end

  # @param pairings [Array<Array<SwissPlayer>>]
  # @return [Array<Array<SwissPlayer>>]
  def sort_pairings_by_rankings(pairings)
    pairings.sort do |pair1, pair2|
      next +1 if pair1[1].nil?
      next -1 if pair2[1].nil?

      rankings1 = calculate_rankings_for_pairing(*pair1)
      rankings2 = calculate_rankings_for_pairing(*pair2)

      rankings2 <=> rankings1
    end
  end
end
