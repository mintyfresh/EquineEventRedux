class AddDeletedInToEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :events, :deleted_in, :uuid
  end
end
