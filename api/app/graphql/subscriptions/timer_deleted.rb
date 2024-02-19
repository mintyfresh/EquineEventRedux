# frozen_string_literal: true

module Subscriptions
  class TimerDeleted < BaseSubscription
    argument :event_id, ID, required: true

    field :timer_id, ID, null: false
  end
end
