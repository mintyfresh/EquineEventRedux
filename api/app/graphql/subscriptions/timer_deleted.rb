# frozen_string_literal: true

module Subscriptions
  class TimerDeleted < BaseSubscription
    argument :round_id, ID, required: true

    field :timer_id, ID, null: false
  end
end
