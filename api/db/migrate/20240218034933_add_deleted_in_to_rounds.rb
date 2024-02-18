class AddDeletedInToRounds < ActiveRecord::Migration[7.1]
  def change
    add_column :rounds, :deleted_in, :uuid
  end
end
