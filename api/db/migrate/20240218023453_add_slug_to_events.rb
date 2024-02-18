# frozen_string_literal: true

class AddSlugToEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :events, :slug, :string

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            events
          SET
            slug = id::text
        SQL

        execute(<<-SQL.squish)
          WITH events_with_duplicate_names AS (
            SELECT
              events.id AS event_id,
              events.name || '-' || (ROW_NUMBER() OVER (PARTITION BY events.name ORDER BY events.id))::text AS name
            FROM
              events
            WHERE
              events.name IN (
                SELECT
                  name
                FROM
                  events
                GROUP BY
                  name
                HAVING
                  COUNT(*) > 1
              )
          )
          UPDATE
            events
          SET
            name = events_with_duplicate_names.name
          FROM
            events_with_duplicate_names
          WHERE
            events.id = events_with_duplicate_names.event_id
        SQL

        change_column_null :events, :slug, false

        add_index :events, :slug, unique: true, where: 'deleted_at IS NULL'
        add_index :events, :name, unique: true, where: 'deleted_at IS NULL'
      end
    end
  end
end
