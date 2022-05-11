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

ActiveRecord::Schema[7.0].define(version: 2022_05_11_042440) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "matches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "round_id", null: false
    t.uuid "player1_id", null: false
    t.uuid "player2_id"
    t.uuid "winner_id"
    t.boolean "draw", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["player1_id"], name: "index_matches_on_player1_id"
    t.index ["player2_id"], name: "index_matches_on_player2_id"
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
    t.index ["event_id", "name"], name: "index_players_on_event_id_and_name", unique: true
    t.index ["event_id"], name: "index_players_on_event_id"
  end

  create_table "rounds", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id", null: false
    t.integer "number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id", "number"], name: "index_rounds_on_event_id_and_number", unique: true
    t.index ["event_id"], name: "index_rounds_on_event_id"
  end

  add_foreign_key "matches", "players", column: "player1_id"
  add_foreign_key "matches", "players", column: "player2_id"
  add_foreign_key "matches", "rounds"
  add_foreign_key "players", "events"
  add_foreign_key "rounds", "events"

  create_view "player_score_cards", sql_definition: <<-SQL
      SELECT players.id AS player_id,
      count(matches.id) AS matches_count,
      count(matches.id) FILTER (WHERE (matches.winner_id = players.id)) AS wins_count,
      count(matches.id) FILTER (WHERE ((matches.winner_id IS NOT NULL) AND (matches.winner_id <> players.id))) AS losses_count,
      count(matches.id) FILTER (WHERE matches.draw) AS draws_count
     FROM (players
       LEFT JOIN matches ON (((matches.player1_id = players.id) OR (matches.player2_id = players.id))))
    GROUP BY players.id;
  SQL
end
