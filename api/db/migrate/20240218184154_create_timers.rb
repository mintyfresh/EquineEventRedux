# frozen_string_literal: true

class CreateTimers < ActiveRecord::Migration[7.1]
  def change
    create_table :timers, id: :uuid do |t|
      t.belongs_to :preset, null: false, foreign_key: { to_table: :timer_presets }, type: :uuid
      t.belongs_to :round, null: false, foreign_key: true, type: :uuid
      t.belongs_to :match, index: { unique: true }, foreign_key: true, type: :uuid
      t.string     :label
      t.timestamp  :expires_at
      t.timestamp  :paused_at
      t.timestamps
    end
  end
end
