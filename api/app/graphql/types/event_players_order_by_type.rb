# frozen_string_literal: true

module Types
  class EventPlayersOrderByType < BaseOrderByEnum
    order_by 'NAME', default: true do |direction|
      Player.order(name: direction)
    end

    order_by 'WINS_COUNT' do |direction|
      Player.order(wins_count: direction, created_at: direction, id: direction)
    end

    order_by 'DRAWS_COUNT' do |direction|
      Player..order(draws_count: direction, created_at: direction, id: direction)
    end

    order_by 'LOSSES_COUNT' do |direction|
      Player.order(losses_count: direction, created_at: direction, id: direction)
    end

    order_by 'SCORE' do |direction|
      Player.order_by_score(direction).order(id: direction)
    end
  end
end
