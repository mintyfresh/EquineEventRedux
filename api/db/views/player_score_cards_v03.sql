SELECT
  players.id AS player_id,
  ARRAY_AGG(DISTINCT opponents.id) AS opponent_ids,
  COALESCE(
    AVG(
      CASE
        WHEN opponents.maximum_possible_score = 0 THEN 0::numeric
        ELSE opponents.score / opponents.maximum_possible_score::numeric
      END
    ),
    0::numeric
  ) AS opponent_win_rate
FROM
  players
LEFT JOIN
  matches ON (matches.player1_id = players.id OR matches.player2_id = players.id) AND matches.deleted_at IS NULL
LEFT JOIN
  players AS opponents ON (opponents.id = matches.player1_id OR opponents.id = matches.player2_id) AND opponents.id != players.id
GROUP BY
  players.id
