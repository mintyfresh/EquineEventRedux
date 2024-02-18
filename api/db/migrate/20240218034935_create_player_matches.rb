# frozen_string_literal: true

class CreatePlayerMatches < ActiveRecord::Migration[7.1]
  def change
    create_view :player_matches
  end
end
