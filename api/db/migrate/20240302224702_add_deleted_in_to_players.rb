# frozen_string_literal: true

class AddDeletedInToPlayers < ActiveRecord::Migration[7.1]
  def change
    add_column :players, :deleted_in, :uuid
  end
end
