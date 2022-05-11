# frozen_string_literal: true

class CreatePlayerScoreCards < ActiveRecord::Migration[7.0]
  def change
    create_view :player_score_cards
  end
end
