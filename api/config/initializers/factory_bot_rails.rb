# frozen_string_literal: true

if defined?(FactoryBot)
  class GraphQLInputStrategy < FactoryBot::Strategy::Build
    def result(evaluation)
      super.tap do |instance|
        evaluation.notify(:before_graphql_input, instance)
        instance.deep_transform_keys! { |key| key.to_s.camelize(:lower) }
        instance.deep_transform_values! { |value| serialize_value_for_graphql(value) }
        evaluation.notify(:after_graphql_input, instance)
      end
    end

    def to_sym
      :graphql_input
    end

  private

    def serialize_value_for_graphql(value)
      case value
      when BigDecimal, Float
        value
      when ActiveSupport::TimeWithZone
        value.iso8601
      else
        value.as_json
      end
    end
  end

  FactoryBot.register_strategy(:graphql_input, GraphQLInputStrategy)
end
