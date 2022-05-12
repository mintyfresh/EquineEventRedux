# frozen_string_literal: true

module Types
  class BaseOrderByEnum < BaseEnum
    # @param name [String]
    # @return [void]
    def self.order_by(name, **options, &block)
      raise ArgumentError, '`order_by` does not support a `value` argument' if options[:value]

      value name, **options, value: block
    end

    # @param name [String]
    # @return [void]
    def self.default_order_by(name)
      define_singleton_method(:default_value) do
        @default_value ||= values.fetch(name).value
      end
    end
  end
end
