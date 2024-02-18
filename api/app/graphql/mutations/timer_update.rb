# frozen_string_literal: true

module Mutations
  class TimerUpdate < RecordUpdate['Timer']
    def resolve(**)
      result = super(**)

      TimerSchema.subscriptions.trigger(
        :timer, { event_id: timer.event_id }, { event_type: TimerEvent::UPDATE, timer: result[:timer] }
      )

      result
    end
  end
end
