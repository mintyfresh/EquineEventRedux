# frozen_string_literal: true

class CreatePlayers < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'citext'

    create_table :players, id: :uuid do |t|
      t.belongs_to :event, null: false, foreign_key: true, type: :uuid
      t.citext     :name, null: false
      t.boolean    :paid, null: false, default: false
      t.boolean    :dropped, null: false, default: false
      t.timestamps null: false
      t.timestamp  :deleted_at

      t.index %i[event_id name], unique: true
    end
  end
end
