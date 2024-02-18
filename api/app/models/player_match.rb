# frozen_string_literal: true

# == Schema Information
#
# Table name: player_matches
#
#  match_id    :uuid
#  round_id    :uuid
#  player_id   :uuid
#  opponent_id :uuid
#  table       :integer
#  complete    :boolean
#  result      :text
#
class PlayerMatch < ApplicationRecord
  belongs_to :match, inverse_of: false
  belongs_to :round, inverse_of: false
  belongs_to :player, inverse_of: :player_matches
  belongs_to :opponent, class_name: 'Player', inverse_of: :opponent_matches

  enum :result, {
    win:        'win',
    draw:       'draw',
    loss:       'loss',
    incomplete: 'incomplete'
  }

  scope :complete, -> { where(complete: true) }
end
