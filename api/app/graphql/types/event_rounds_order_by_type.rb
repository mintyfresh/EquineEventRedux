# frozen_string_literal: true

module Types
  class EventRoundsOrderByType < BaseOrderByEnum
    order_by 'NUMBER' do |direction|
      Round.order(number: direction)
    end

    default_order_by 'NUMBER'
  end
end
