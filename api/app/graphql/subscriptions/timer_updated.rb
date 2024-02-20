# frozen_string_literal: true

module Subscriptions
  class TimerUpdated < BaseSubscription
    argument :event_id, ID, required: true

    field :timer, Types::TimerType, null: false
  end
end
