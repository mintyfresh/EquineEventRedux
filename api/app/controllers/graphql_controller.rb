# frozen_string_literal: true

class GraphqlController < ApplicationController
  # If accessing from outside this domain, nullify the session
  # This allows for outside API access while preventing CSRF attacks,
  # but you'll have to authenticate your user separately
  # protect_from_forgery with: :null_session

  def execute
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]
    context = {
      # Query context goes here, for example:
      # current_user: current_user,
    }
    result = EquineEventApiSchema.execute(query, variables:, context:, operation_name:)
    render json: result
  rescue StandardError => error
    raise error unless Rails.env.development?

    handle_error_in_development(error)
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
