# frozen_string_literal: true

module Subscriptions
  class Timer < BaseSubscription
    argument :event_id, ID, required: true

    field :event_type, Types::TimerEventTypeType, null: false
    field :timer, Types::TimerType, null: false
  end
end
