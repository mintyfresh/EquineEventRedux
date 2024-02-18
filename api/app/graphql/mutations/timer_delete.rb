# frozen_string_literal: true

module Mutations
  class TimerDelete < RecordDelete['Timer']
    def resolve(**)
      timer = nil

      result = super(**) do |record|
        timer = record
      end

      TimerSchema.subscriptions.trigger(
        :timer, { event_id: timer.event_id }, { event_type: TimerEvent::DELETE, timer: }
      )

      result
    end
  end
end
