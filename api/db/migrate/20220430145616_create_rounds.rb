# frozen_string_literal: true

class CreateRounds < ActiveRecord::Migration[7.0]
  def change
    create_table :rounds, id: :uuid do |t|
      t.belongs_to :event, null: false, foreign_key: true, type: :uuid
      t.integer    :number, null: false
      t.timestamps

      t.index %i[event_id number], unique: true
    end
  end
end
