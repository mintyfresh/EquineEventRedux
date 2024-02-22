# frozen_string_literal: true

class CreateTimerPhases < ActiveRecord::Migration[7.1]
  def change # rubocop:disable Metrics/MethodLength
    create_table :timer_phases, id: :uuid do |t|
      t.belongs_to :timer, null: false, foreign_key: true, type: :uuid
      t.belongs_to :preset_phase, null: false, foreign_key: { to_table: :timer_preset_phases }, type: :uuid
      t.belongs_to :audio_clip, foreign_key: true, type: :uuid
      t.string     :name, null: false
      t.integer    :position, null: false
      t.integer    :duration_amount, null: false
      t.string     :duration_unit, null: false
      t.integer    :offset_from_start, null: false
      t.integer    :offset_from_end, null: false
      t.integer    :extension_in_seconds, null: false, default: 0
      t.timestamps

      t.check_constraint 'duration_amount > 0'
    end
  end
end
