# frozen_string_literal: true

module Extensions
  module Players
    class ActiveOnlyExtension < BaseExtension
      def apply
        field.argument :active_only, GraphQL::Types::Boolean, required: false, default_value: false do
          description 'If true, unpaid and dropped players will be excluded'
        end
      end
    end
  end
end
