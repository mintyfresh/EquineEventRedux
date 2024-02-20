# frozen_string_literal: true

module Subscriptions
  class TimerCreated < BaseSubscription
    argument :event_id, ID, required: true

    field :timer, Types::TimerType, null: false
  end
end
