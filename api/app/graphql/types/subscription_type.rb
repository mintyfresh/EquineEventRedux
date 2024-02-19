# frozen_string_literal: true

module Types
  class SubscriptionType < BaseObject
    field :timer_event, subscription: Subscriptions::TimerEvent
    field :timer_deleted, subscription: Subscriptions::TimerDeleted
  end
end
