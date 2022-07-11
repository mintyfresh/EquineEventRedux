# frozen_string_literal: true

class AddDeletedAtToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :deleted_at, :timestamp
  end
end
