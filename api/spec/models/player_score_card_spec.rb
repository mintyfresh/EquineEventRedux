# frozen_string_literal: true

# == Schema Information
#
# Table name: player_score_cards
#
#  player_id               :uuid
#  matches_count           :bigint
#  completed_matches_count :bigint
#  wins_count              :bigint
#  losses_count            :bigint
#  draws_count             :bigint
#  opponent_ids            :uuid             is an Array
#
require 'rails_helper'

RSpec.describe PlayerScoreCard, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
