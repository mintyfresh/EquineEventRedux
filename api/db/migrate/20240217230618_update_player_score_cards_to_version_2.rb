# frozen_string_literal: true

class UpdatePlayerScoreCardsToVersion2 < ActiveRecord::Migration[7.1]
  def change
    update_view :player_score_cards, version: 2, revert_to_version: 1
  end
end
