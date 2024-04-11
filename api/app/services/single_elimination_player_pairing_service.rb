# frozen_string_literal: true

class SingleEliminationPlayerPairingService
  # @param event [SingleEliminationEvent]
  def initialize(event)
    @event   = event
    @players = event.players.order_by_swiss_ranking.to_a
  end

  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings(round_number)
    pairings = generate_initial_pairings

    (round_number - 1).times do
      pairings = pairings.each_slice(2).map do |pairing1, pairing2|
        winner1 = pairing1.compact.reject(&:dropped?).max_by(&:wins_count)
        winner2 = pairing2.compact.reject(&:dropped?).max_by(&:wins_count)

        [winner1, winner2]
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
