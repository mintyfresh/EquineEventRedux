# frozen_string_literal: true

module Types
  class TopCutEventCreateInputType < BaseInputObject
    argument :name, String, required: true
    argument :swiss_event_id, ID, required: true
    argument :swiss_player_ids, [ID], required: true
    argument :pairing_mode, Types::TopCutPairingModeType, required: true

    # @return [SwissEvent]
    def swiss_event
      @swiss_event ||= SwissEvent.find(swiss_event_id)
    end

    # @return [Hash{SwissPlayer => Integer}]
    def swiss_players_with_rankings
      @swiss_players_with_rankings ||= swiss_event.players
        .where_any(:id, swiss_player_ids)
        .order_by_score
        .each.with_index(1)
        .to_h
    end

    # @return [Hash]
    def prepare
      super.to_h.merge(type: 'TopCutEvent').tap do |hash|
        hash.delete(:swiss_player_ids) # remove transient attribute
        hash[:players] = swiss_players_with_rankings.map do |swiss_player, swiss_ranking|
          TopCutPlayer.new(name: swiss_player.name, swiss_player_id: swiss_player.id, swiss_ranking:)
        end
      end
    end
  end
end
