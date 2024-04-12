# frozen_string_literal: true

class SingleEliminationPlayerPairingService
  # @param event [SingleEliminationEvent]
  def initialize(event)
    @event   = event
    @players = event.players.order_by_swiss_ranking.to_a

    # check if the number of players is a power of 2
    return if (base = Math.log2(@players.count)).round == base

    # the required number of placeholder spots to make the number of players a power of 2
    required_byes_count = (2**base.ceil) - @players.count

    # inject nils in-between players
    required_byes_count.times do |index|
      @players.insert((index * 2) + 1, nil)
    end
  end

  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings(round_number)
    pairings = generate_initial_pairings

    (round_number - 1).times do
      pairings = pairings.each_slice(2).filter_map do |pairing1, pairing2|
        player1 = pairing1.compact.reject(&:dropped?).max_by(&:wins_count)
        player2 = pairing2.compact.reject(&:dropped?).max_by(&:wins_count)

        # if only 1 player is available, assign them as player 1
        player1, player2 = player2, player1 if player1.nil?

        [player1, player2]
      end
    end

    pairings
  end

  # Generate the list of player pairings for the first round.
  #
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_initial_pairings
    case @event.pairing_mode
    when 'top_to_bottom'
      # pair the top player with the bottom player, the second player with the second-to-last player, and so on
      top_players    = @players.first(@players.count / 2)
      bottom_players = @players.last(@players.count / 2).reverse

      top_players.zip(bottom_players)
    when 'sequential'
      @players.each_slice(2).to_a
    else
      raise NotImplementedError, "pairing mode #{@event.pairing_mode} is not implemented"
    end
  end
end
