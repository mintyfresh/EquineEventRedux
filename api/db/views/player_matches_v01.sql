SELECT
  matches.id AS match_id,
  matches.round_id AS round_id,
  matches.player1_id AS player_id,
  matches.player2_id AS opponent_id,
  matches.table AS table,
  matches.draw OR matches.winner_id IS NOT NULL AS complete,
  CASE
    WHEN matches.draw THEN 'draw'
    WHEN matches.winner_id = matches.player1_id THEN 'win'
    WHEN matches.winner_id = matches.player2_id THEN 'loss'
    ELSE 'incomplete'
  END AS result
FROM
  matches
WHERE
  matches.deleted_at IS NULL
UNION ALL SELECT
  matches.id AS match_id,
  matches.round_id AS round_id,
  matches.player2_id AS player_id,
  matches.player1_id AS opponent_id,
  matches.table AS table,
  matches.draw OR matches.winner_id IS NOT NULL AS complete,
  CASE
    WHEN matches.draw THEN 'draw'
    WHEN matches.winner_id = matches.player2_id THEN 'win'
    WHEN matches.winner_id = matches.player1_id THEN 'loss'
    ELSE 'incomplete'
  END AS result
FROM
  matches
WHERE
  matches.player2_id IS NOT NULL
AND
  matches.deleted_at IS NULL
