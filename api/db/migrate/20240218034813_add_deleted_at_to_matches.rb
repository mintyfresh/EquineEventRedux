# frozen_string_literal: true

class AddDeletedAtToMatches < ActiveRecord::Migration[7.1]
  def change
    change_table :matches, bulk: true do |t|
      t.column :deleted_at, :timestamp
      t.column :deleted_in, :uuid
    end

    remove_index :matches, %i[round_id table], unique: true
    add_index :matches, %i[round_id table], unique: true, where: 'deleted_at IS NULL'
  end
end
