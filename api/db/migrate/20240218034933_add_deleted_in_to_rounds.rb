# frozen_string_literal: true

class AddDeletedInToRounds < ActiveRecord::Migration[7.1]
  def change
    add_column :rounds, :deleted_in, :uuid
  end
end
