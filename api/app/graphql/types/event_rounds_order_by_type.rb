# frozen_string_literal: true

module Types
  class EventRoundsOrderByType < BaseOrderByEnum
    order_by 'NUMBER', default: true do |direction|
      Round.order(number: direction)
    end
  end
end
