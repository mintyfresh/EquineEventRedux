# frozen_string_literal: true

module Mutations
  class TimerUpdate < RecordUpdate['Timer']
    def resolve(**)
      result = super(**)

      EquineEventApiSchema.subscriptions.trigger(
        :timer_event, { event_id: timer.event_id }, { event_type: TimerEvent::UPDATE, timer: result[:timer] }
      )

      result
    end
  end
end
