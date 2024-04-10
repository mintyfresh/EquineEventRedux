# frozen_string_literal: true

class AddTypeToPlayers < ActiveRecord::Migration[7.1]
  def change
    change_table :players, bulk: true do |t|
      t.column :type, :string
      t.column :data, :jsonb, null: false, default: {}
    end

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            players
          SET
            type = 'SwissEvent'
        SQL

        change_column_null :players, :type, false
      end
    end
  end
end
