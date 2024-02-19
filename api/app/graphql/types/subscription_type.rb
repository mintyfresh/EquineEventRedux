# frozen_string_literal: true

module Types
  class SubscriptionType < BaseObject
    field :timer_event, subscription: Subscriptions::TimerEvent
  end
end
