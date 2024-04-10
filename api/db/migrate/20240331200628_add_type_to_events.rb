# frozen_string_literal: true

class AddTypeToEvents < ActiveRecord::Migration[7.1]
  def change
    change_table :events, bulk: true do |t|
      t.column :type, :string
      t.column :data, :jsonb, null: false, default: {}
    end

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            events
          SET
            type = 'SwissEvent'
        SQL

        change_column_null :events, :type, false
      end
    end
  end
end
