# frozen_string_literal: true

class AddCompleteToRounds < ActiveRecord::Migration[7.1]
  def change
    add_column :rounds, :complete, :boolean, default: false, null: false

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            rounds
          SET
            complete = TRUE
          WHERE
            NOT EXISTS (
              SELECT FROM
                matches
              WHERE
                matches.round_id = rounds.id
              AND
                matches.complete = FALSE
              AND
                matches.deleted_at IS NULL
            )
        SQL
      end
    end
  end
end
