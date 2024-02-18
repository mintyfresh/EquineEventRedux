# frozen_string_literal: true

module Types
  class SubscriptionType < BaseObject
    field :timer, subscription: Subscriptions::Timer
  end
end
