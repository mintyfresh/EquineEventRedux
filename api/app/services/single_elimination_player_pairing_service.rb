# frozen_string_literal: true

class SingleEliminationPlayerPairingService
  # @param event [SingleEliminationEvent]
  def initialize(event)
    @event = event
  end

  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings(round_number)
    if round_number <= 1
      generate_initial_pairings
    elsif (pairings = extract_pairings_from_round(round_number)).present?
      generate_pairings_for_following_round(pairings)
    else
      generate_pairings_for_following_round(generate_pairings(round_number - 1))
    end
  end

private

  # Generates pairings for the following round based on the results of the previous round.
  #
  # @param pairings [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_pairings_for_following_round(pairings)
    pairings.each_slice(2).filter_map do |pairing1, pairing2|
      player1 = pairing1.compact.reject(&:dropped?).max_by(&:wins_count)
      player2 = pairing2.compact.reject(&:dropped?).max_by(&:wins_count)

      # if only 1 player is available, assign them as player 1
      player1, player2 = player2, player1 if player1.nil?

      [player1, player2]
    end
  end

  # Extracts the pairings for a given round from the event, if they exist.
  # Returns nil if the round does not exist.
  #
  # @param round_number [Integer]
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>, nil]
  def extract_pairings_from_round(round_number)
    @event.rounds.non_deleted.preload(:player1, :player2).find_by(number: round_number)&.pairings
  end

  # Generates the initial list of pairings based on the event's pairing mode.
  #
  # @return [Array<(SingleEliminationPlayer, SingleEliminationPlayer)>]
  def generate_initial_pairings
    case @event.pairing_mode
    when 'top_to_bottom'
      top_players_count = players.count / 2

      # bisect the players list into two halves
      # since the list is padded to a power of 2, the halves will be equal
      top_players    = players.take(top_players_count)
      bottom_players = players.drop(top_players_count)

      # pair the top player with the bottom player,
      # the second player with the second-to-last player,
      # and so on
      top_players.zip(bottom_players.reverse)
    when 'sequential'
      players.each_slice(2).to_a
    else
      raise NotImplementedError, "pairing mode #{@event.pairing_mode} is not implemented"
    end
  end

  # @return [Array<SingleEliminationPlayer>]
  def players
    @players ||= begin
      players = @event.players.order_by_swiss_ranking.to_a

      # check if the number of players is a power of 2
      if (base = Math.log2(players.count)).round != base
        # the required number of placeholder spots to make the number of players a power of 2
        required_byes_count = (2**base.ceil) - players.count

        # inject nils in between players
        required_byes_count.times do |index|
          players.insert((index * 2) + 1, nil)
        end
      end

      players
    end
  end
end
