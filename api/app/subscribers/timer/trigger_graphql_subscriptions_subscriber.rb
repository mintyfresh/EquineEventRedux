# frozen_string_literal: true

class Timer
  class TriggerGraphqlSubscriptionsSubscriber < ApplicationSubscriber
    subscribes_to Timer::CreateMessage, Timer::UpdateMessage, Timer::DestroyMessage

    def perform
      EquineEventApiSchema.subscriptions.trigger(subscription, subscription_arguments, subscription_payload)
    end

  private

    # @return [Symbol]
    def subscription
      case message
      when Timer::CreateMessage  then :timer_created
      when Timer::UpdateMessage  then :timer_updated
      when Timer::DestroyMessage then :timer_deleted
      else raise "Unknown message: #{message}"
      end
    end

    # @return [Hash]
    def subscription_arguments
      { round_id: message.timer.round_id }
    end

    # @return [Hash]
    def subscription_payload
      case message
      when Timer::CreateMessage, Timer::UpdateMessage
        { timer: message.timer }
      when Timer::DestroyMessage
        { timer_id: message.timer.id }
      else
        raise "Unknown message: #{message}"
      end
    end
  end
end
