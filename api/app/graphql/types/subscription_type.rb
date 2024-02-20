# frozen_string_literal: true

module Types
  class SubscriptionType < BaseObject
    field :timer_created, subscription: Subscriptions::TimerCreated
    field :timer_updated, subscription: Subscriptions::TimerUpdated
    field :timer_deleted, subscription: Subscriptions::TimerDeleted
  end
end
