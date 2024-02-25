# frozen_string_literal: true

class GraphqlController < ApplicationController
  wrap_parameters false

  if Rails.env.development?
    rescue_from StandardError do |error|
      handle_error_in_development(error)
    end
  end

  def execute
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]
    context = { host: request.host_with_port }

    result = EquineEventApiSchema.execute(query, variables:, context:, operation_name:)
    render json: result
  end

private

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

  # @param error [StandardError]
  # @return [void]
  def handle_error_in_development(error)
    logger.error(error.message)
    logger.error(error.backtrace.join("\n"))

    error = { message: error.message, backtrace: error.backtrace }

    render json: { errors: [error], data: {} }, status: :internal_server_error
  end
end
