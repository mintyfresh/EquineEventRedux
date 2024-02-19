# frozen_string_literal: true

class GraphqlChannel < ApplicationCable::Channel
  def subscribed
    @subscription_ids = []
  end

  def execute(data)
    result  = execute_subscription_query(data)
    payload = { result: result.to_h, more: result.subscription? }

    # Track the subscription here so we can remove it on unsubscribe.
    @subscription_ids << result.context[:subscription_id] if result.context[:subscription_id]

    transmit(payload)
  end

  def unsubscribed
    @subscription_ids.each do |sid|
      EquineEventApiSchema.subscriptions.delete_subscription(sid)
    end
  end

private

  # @return [Hash]
  def execute_subscription_query(data)
    query          = data['query']
    variables      = prepare_variables(data['variables'])
    operation_name = data['operationName']
    context        = {
      channel: self,
      host:    ActionDispatch::Request.new(connection.env).host_with_port
    }

    EquineEventApiSchema.execute(
      query,
      context:,
      variables:,
      operation_name:
    )
  end

  # Handle variables in form data, JSON body, or a blank value
  #
  # @param variables_param [String, ActionController::Parameters, Hash, nil]
  # @return [Hash]
  def prepare_variables(variables_param)
    case variables_param
    when String, nil
      variables_param.present? ? JSON.parse(variables_param) || {} : {}
    when Hash
      variables_param
    when ActionController::Parameters
      variables_param.to_unsafe_hash # GraphQL-Ruby will validate name and type of incoming variables.
    else
      raise ArgumentError, "Unexpected parameter: #{variables_param}"
    end
  end
end
