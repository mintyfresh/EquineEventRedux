# frozen_string_literal: true

module Subscriptions
  class TimerUpdated < BaseSubscription
    argument :round_id, ID, required: true

    field :timer, Types::TimerType, null: false
  end
end
