# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id         :uuid             primary key
#  opponent_ids      :uuid             is an Array
#  opponent_win_rate :decimal(, )
#
class PlayerScoreCard < ApplicationRecord
  self.primary_key = :player_id
  self.implicit_order_column = :player_id

  belongs_to :player, inverse_of: :score_card

  # @return [Boolean]
  def readonly?
    true # Table is a database view
  end
end
