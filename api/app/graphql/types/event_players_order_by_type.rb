# frozen_string_literal: true

module Types
  class EventPlayersOrderByType < BaseOrderByEnum
    order_by 'NAME' do |direction|
      Player.order(name: direction)
    end

    order_by 'WINS_COUNT' do |direction|
      Player.joins(:score_card)
        .merge(PlayerScoreCard.order(wins_count: direction))
        .order(created_at: direction, id: direction)
    end

    order_by 'DRAWS_COUNT' do |direction|
      Player.joins(:score_card)
        .merge(PlayerScoreCard.order(draws_count: direction))
        .order(created_at: direction, id: direction)
    end

    order_by 'LOSSES_COUNT' do |direction|
      Player.joins(:score_card)
        .merge(PlayerScoreCard.order(losses_count: direction))
        .order(created_at: direction, id: direction)
    end

    order_by 'SCORE' do |direction|
      Player.joins(:score_card)
        .merge(PlayerScoreCard.order_by_score(direction))
        .order(created_at: direction, id: direction)
    end

    default_order_by 'NAME'
  end
end
