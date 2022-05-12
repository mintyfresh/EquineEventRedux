SELECT
  players.id AS player_id,
  COUNT(DISTINCT matches.id) AS matches_count,
  COUNT(DISTINCT matches.id) FILTER (WHERE matches.winner_id = players.id) AS wins_count,
  COUNT(DISTINCT matches.id) FILTER (WHERE matches.winner_id IS NOT NULL AND matches.winner_id != players.id) AS losses_count,
  COUNT(DISTINCT matches.id) FILTER (WHERE matches.draw) AS draws_count,
  ARRAY_AGG(DISTINCT matches.id) AS match_ids,
  ARRAY_AGG(DISTINCT opponents.id) AS opponent_ids
FROM
  players
LEFT JOIN
  matches ON matches.player1_id = players.id OR matches.player2_id = players.id
LEFT JOIN
  players AS opponents ON (opponents.id = matches.player1_id OR opponents.id = matches.player2_id) AND opponents.id != players.id
GROUP BY
  players.id
