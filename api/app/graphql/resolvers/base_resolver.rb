# frozen_string_literal: true

module Resolvers
  class BaseResolver < GraphQL::Schema::Resolver
    # @return [void]
    def self.inherited(subclass)
      super
      subclass.description(description) if description
    end
  end
end
