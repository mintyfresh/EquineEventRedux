# frozen_string_literal: true

class CreateAudioClips < ActiveRecord::Migration[7.1]
  def change
    create_table :audio_clips, id: :uuid do |t|
      t.string :name, null: false
      t.string :system_ref, index: { unique: true }
      t.timestamps
    end

    add_foreign_key :timer_preset_phases, :audio_clips
  end
end
