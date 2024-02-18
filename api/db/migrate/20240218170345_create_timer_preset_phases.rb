# frozen_string_literal: true

class CreateTimerPresetPhases < ActiveRecord::Migration[7.1]
  def change
    create_table :timer_preset_phases, id: :uuid do |t|
      t.belongs_to :timer_preset, null: false, foreign_key: true, type: :uuid
      t.belongs_to :audio_clip, type: :uuid
      t.string     :name, null: false
      t.integer    :position, null: false
      t.integer    :duration_amount, null: false
      t.string     :duration_unit, null: false
      t.timestamps

      t.index %i[timer_preset_id name], unique: true

      t.check_constraint 'duration_amount > 0'
    end
  end
end
