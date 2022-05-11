# frozen_string_literal: true

module Extensions
  class OrderByExtension < BaseExtension
    def apply
      field.argument :order_by, options[:type], required: false, default_value: options[:type].try(:default_value)
      field.argument :order_by_direction, Types::OrderByDirectionType, required: false, default_value: 'ASC'
    end

    def resolve(object:, arguments:, **)
      order_by = arguments[:order_by]
      order_by_direction = arguments[:order_by_direction] || 'ASC'
      order_by = order_by.call(order_by_direction) if order_by

      yield(object, arguments.except(:order_by_direction).merge(order_by:))
    end
  end
end
