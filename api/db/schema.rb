# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_03_31_201425) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audio_clips", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "system_ref"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["system_ref"], name: "index_audio_clips_on_system_ref", unique: true
  end

  create_table "events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at", precision: nil
    t.string "slug", null: false
    t.string "type", null: false
    t.jsonb "data", default: {}, null: false
    t.index ["name"], name: "index_events_on_name", unique: true, where: "(deleted_at IS NULL)"
    t.index ["slug"], name: "index_events_on_slug", unique: true, where: "(deleted_at IS NULL)"
  end

  create_table "matches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "round_id", null: false
    t.uuid "player1_id", null: false
    t.uuid "player2_id"
    t.uuid "winner_id"
    t.boolean "draw", default: false, null: false
    t.integer "table", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at", precision: nil
    t.uuid "deleted_in"
    t.boolean "complete", default: false, null: false
    t.index ["player1_id"], name: "index_matches_on_player1_id"
    t.index ["player2_id"], name: "index_matches_on_player2_id"
    t.index ["round_id", "table"], name: "index_matches_on_round_id_and_table", unique: true, where: "(deleted_at IS NULL)"
    t.index ["round_id"], name: "index_matches_on_round_id"
    t.check_constraint "NOT (winner_id IS NOT NULL AND draw = true)"
    t.check_constraint "winner_id IS NULL OR winner_id = player1_id OR winner_id = player2_id"
  end

  create_table "players", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id", null: false
    t.citext "name", null: false
    t.boolean "paid", default: false, null: false
    t.boolean "dropped", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at", precision: nil
    t.integer "completed_matches_count", default: 0, null: false
    t.integer "wins_count", default: 0, null: false
    t.integer "draws_count", default: 0, null: false
    t.integer "losses_count", default: 0, null: false
    t.integer "score", default: 0, null: false
    t.integer "maximum_possible_score", default: 0, null: false
    t.string "type", null: false
    t.jsonb "data", default: {}, null: false
    t.index ["event_id", "name"], name: "index_players_on_event_id_and_name", unique: true, where: "(deleted_at IS NULL)"
    t.index ["event_id"], name: "index_players_on_event_id"
  end

  create_table "rounds", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id", null: false
    t.integer "number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at", precision: nil
    t.uuid "deleted_in"
    t.boolean "complete", default: false, null: false
    t.index ["event_id", "number"], name: "index_rounds_on_event_id_and_number", unique: true, where: "(deleted_at IS NULL)"
    t.index ["event_id"], name: "index_rounds_on_event_id"
  end

  create_table "timer_phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "timer_id", null: false
    t.uuid "preset_phase_id", null: false
    t.uuid "audio_clip_id"
    t.string "name", null: false
    t.integer "position", null: false
    t.integer "duration_amount", null: false
    t.string "duration_unit", null: false
    t.integer "offset_from_start", null: false
    t.integer "offset_from_end", null: false
    t.integer "extension_in_seconds", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["audio_clip_id"], name: "index_timer_phases_on_audio_clip_id"
    t.index ["preset_phase_id"], name: "index_timer_phases_on_preset_phase_id"
    t.index ["timer_id"], name: "index_timer_phases_on_timer_id"
    t.check_constraint "duration_amount > 0"
  end

  create_table "timer_preset_phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "timer_preset_id", null: false
    t.uuid "audio_clip_id"
    t.string "name", null: false
    t.integer "position", null: false
    t.integer "duration_amount", null: false
    t.string "duration_unit", null: false
    t.integer "offset_from_start", null: false
    t.integer "offset_from_end", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["audio_clip_id"], name: "index_timer_preset_phases_on_audio_clip_id"
    t.index ["timer_preset_id", "name"], name: "index_timer_preset_phases_on_timer_preset_id_and_name", unique: true
    t.index ["timer_preset_id"], name: "index_timer_preset_phases_on_timer_preset_id"
    t.check_constraint "duration_amount > 0"
  end

  create_table "timer_presets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "system_ref"
    t.integer "phases_count", default: 0, null: false
    t.interval "total_duration", null: false
    t.datetime "last_used_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_timer_presets_on_name", unique: true
    t.index ["system_ref"], name: "index_timer_presets_on_system_ref", unique: true
  end

  create_table "timers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "preset_id", null: false
    t.uuid "round_id", null: false
    t.uuid "match_id"
    t.string "label"
    t.datetime "expires_at", precision: nil
    t.datetime "paused_at", precision: nil
    t.boolean "primary", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["match_id"], name: "index_timers_on_match_id", unique: true
    t.index ["preset_id"], name: "index_timers_on_preset_id"
    t.index ["round_id"], name: "index_timers_on_round_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "matches", "players", column: "player1_id"
  add_foreign_key "matches", "players", column: "player2_id"
  add_foreign_key "matches", "rounds"
  add_foreign_key "players", "events"
  add_foreign_key "rounds", "events"
  add_foreign_key "timer_phases", "audio_clips"
  add_foreign_key "timer_phases", "timer_preset_phases", column: "preset_phase_id"
  add_foreign_key "timer_phases", "timers"
  add_foreign_key "timer_preset_phases", "audio_clips"
  add_foreign_key "timer_preset_phases", "timer_presets"
  add_foreign_key "timers", "matches"
  add_foreign_key "timers", "rounds"
  add_foreign_key "timers", "timer_presets", column: "preset_id"

  create_view "player_matches", sql_definition: <<-SQL
      SELECT matches.id AS match_id,
      matches.round_id,
      matches.player1_id AS player_id,
      matches.player2_id AS opponent_id,
      matches."table",
      (matches.draw OR (matches.winner_id IS NOT NULL)) AS complete,
          CASE
              WHEN matches.draw THEN 'draw'::text
              WHEN (matches.winner_id = matches.player1_id) THEN 'win'::text
              WHEN (matches.winner_id = matches.player2_id) THEN 'loss'::text
              ELSE 'incomplete'::text
          END AS result
     FROM matches
    WHERE (matches.deleted_at IS NULL)
  UNION ALL
   SELECT matches.id AS match_id,
      matches.round_id,
      matches.player2_id AS player_id,
      matches.player1_id AS opponent_id,
      matches."table",
      (matches.draw OR (matches.winner_id IS NOT NULL)) AS complete,
          CASE
              WHEN matches.draw THEN 'draw'::text
              WHEN (matches.winner_id = matches.player2_id) THEN 'win'::text
              WHEN (matches.winner_id = matches.player1_id) THEN 'loss'::text
              ELSE 'incomplete'::text
          END AS result
     FROM matches
    WHERE ((matches.player2_id IS NOT NULL) AND (matches.deleted_at IS NULL));
  SQL
  create_view "player_score_cards", sql_definition: <<-SQL
      SELECT players.id AS player_id,
      array_agg(DISTINCT opponents.id) AS opponent_ids,
      COALESCE(avg(
          CASE
              WHEN (opponents.maximum_possible_score = 0) THEN (0)::numeric
              ELSE ((opponents.score)::numeric / (opponents.maximum_possible_score)::numeric)
          END), (0)::numeric) AS opponent_win_rate
     FROM ((players
       LEFT JOIN matches ON ((((matches.player1_id = players.id) OR (matches.player2_id = players.id)) AND (matches.deleted_at IS NULL))))
       LEFT JOIN players opponents ON ((((opponents.id = matches.player1_id) OR (opponents.id = matches.player2_id)) AND (opponents.id <> players.id))))
    GROUP BY players.id;
  SQL
end
