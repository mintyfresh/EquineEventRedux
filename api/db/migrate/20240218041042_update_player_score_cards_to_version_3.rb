# frozen_string_literal: true

class UpdatePlayerScoreCardsToVersion3 < ActiveRecord::Migration[7.1]
  def change
    update_view :player_score_cards, version: 3, revert_to_version: 2
  end
end
