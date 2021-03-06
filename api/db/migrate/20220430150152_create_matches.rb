# frozen_string_literal: true

class CreateMatches < ActiveRecord::Migration[7.0]
  def change # rubocop:disable Metrics/MethodLength
    create_table :matches, id: :uuid do |t|
      t.belongs_to :round, null: false, foreign_key: true, type: :uuid
      t.belongs_to :player1, null: false, foreign_key: { to_table: :players }, type: :uuid
      t.belongs_to :player2, null: true,  foreign_key: { to_table: :players }, type: :uuid
      t.uuid       :winner_id
      t.boolean    :draw, null: false, default: false
      t.integer    :table, null: false
      t.timestamps

      # Ensure that the assigned winner is in the list of players
      t.check_constraint 'winner_id IS NULL OR winner_id = player1_id OR winner_id = player2_id'

      # Don't allow for a winner to be selected if the match is a draw
      t.check_constraint 'NOT (winner_id IS NOT NULL AND draw = true)'

      t.index %i[round_id table], unique: true
    end
  end
end
