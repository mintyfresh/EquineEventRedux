# frozen_string_literal: true

class CreateMatches < ActiveRecord::Migration[7.0]
  def change
    create_table :matches, id: :uuid do |t|
      t.belongs_to :round, null: false, foreign_key: true, type: :uuid
      t.uuid       :player_ids, array: true, null: false
      t.uuid       :winner_id
      t.boolean    :draw, null: false, default: false
      t.timestamps

      # Ensure there are exactly 2 players in the match
      t.check_constraint 'array_length(player_ids, 1) = 2'

      # Ensure that the assigned winner is in the list of players
      t.check_constraint 'winner_id IS NULL OR player_ids @> ARRAY[winner_id]'

      # Don't allow for a winner to be selected if the match is a draw
      t.check_constraint 'NOT (winner_id IS NOT NULL AND draw = true)'
    end
  end
end
