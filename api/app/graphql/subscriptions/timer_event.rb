# frozen_string_literal: true

module Subscriptions
  class TimerEvent < BaseSubscription
    argument :event_id, ID, required: true

    field :event_type, Types::TimerEventTypeType, null: true
    field :timer, Types::TimerType, null: true
  end
end
