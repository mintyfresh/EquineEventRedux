# frozen_string_literal: true

class AddCompleteToMatches < ActiveRecord::Migration[7.1]
  def change
    add_column :matches, :complete, :boolean, default: false, null: false

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            matches
          SET
            complete = TRUE
          WHERE
            matches.winner_id IS NOT NULL
          OR
            matches.draw = TRUE
        SQL
      end
    end
  end
end
