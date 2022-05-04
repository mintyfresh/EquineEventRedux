# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'pgcrypto'

    create_table :events, id: :uuid do |t|
      t.string :name, null: false
      t.timestamps
    end
  end
end
