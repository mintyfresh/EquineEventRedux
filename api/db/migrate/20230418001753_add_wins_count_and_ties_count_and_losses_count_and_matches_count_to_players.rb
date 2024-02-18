# frozen_string_literal: true

class AddWinsCountAndTiesCountAndLossesCountAndMatchesCountToPlayers < ActiveRecord::Migration[7.0]
  def change # rubocop:disable Metrics/MethodLength
    change_table :players, bulk: true do |t|
      t.integer :completed_matches_count, null: false, default: 0
      t.integer :wins_count, null: false, default: 0
      t.integer :draws_count, null: false, default: 0
      t.integer :losses_count, null: false, default: 0
      t.integer :score, null: false, default: 0
      t.integer :maximum_possible_score, null: false, default: 0
    end

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            players
          SET
            completed_matches_count = player_score_cards.completed_matches_count,
            wins_count              = player_score_cards.wins_count,
            draws_count             = player_score_cards.draws_count,
            losses_count            = player_score_cards.losses_count,
            score                   = (player_score_cards.wins_count * 3) + (player_score_cards.draws_count * 1),
            maximum_possible_score  = player_score_cards.completed_matches_count * 3
          FROM
            player_score_cards
          WHERE
            player_score_cards.player_id = players.id
        SQL
      end
    end
  end
end
