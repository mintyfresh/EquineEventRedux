# frozen_string_literal: true

class CreateTimerPresets < ActiveRecord::Migration[7.1]
  def change
    create_table :timer_presets, id: :uuid do |t|
      t.string  :name, null: false, index: { unique: true }
      t.string  :system_ref, index: { unique: true }
      t.integer :phases_count, null: false, default: 0
      t.timestamps
    end
  end
end
