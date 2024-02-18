# frozen_string_literal: true

class Match
  class UpdatePlayerScoresSubscriber < ApplicationSubscriber
    subscribes_to Match::CreateMessage do |message|
      message.match.complete?
    end

    subscribes_to Match::UpdateMessage do |message|
      message.match.complete? ||
        message.changes.key?('winner_id') ||
        message.changes.key?('draw')
    end

    subscribes_to Match::DestroyMessage do |message|
      message.match.complete?
    end

    def perform
      Player.transaction do
        Player.lock.find(affected_player_ids).each(&:calculate_statistics!)
      end
    end

  private

    # @return [Array<String>]
    def affected_player_ids
      @affected_player_ids ||= [
        *message.match.player_ids,
        *message.try(:changes).try(:[], 'player1_id'), # if the player was changed
        *message.try(:changes).try(:[], 'player2_id')  # if the player was changed
      ].compact.uniq
    end
  end
end
