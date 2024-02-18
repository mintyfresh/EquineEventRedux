# frozen_string_literal: true

module Types
  class ISO8601DurationType < Types::BaseScalar
    description 'An ISO 8601-encoded duration string'

    # @param input_value [String]
    # @param _context [GraphQL::Query::Context]
    # @return [ActiveSupport::Duration]
    def self.coerce_input(input_value, _context)
      ActiveSupport::Duration.parse(input_value)
    rescue ActiveSupport::Duration::ISO8601Parser::ParsingError => error
      raise GraphQL::CoercionError, error.message
    end

    # @param ruby_value [ActiveSupport::Duration]
    # @param _context [GraphQL::Query::Context]
    # @return [String]
    def self.coerce_result(ruby_value, _context)
      ruby_value.iso8601
    end
  end
end
