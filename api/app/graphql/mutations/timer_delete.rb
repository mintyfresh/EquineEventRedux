# frozen_string_literal: true

module Mutations
  class TimerDelete < RecordDelete['Timer']
    def resolve(id:, **)
      event_id = nil

      result = super(id:, **) do |timer|
        event_id = timer.event_id
      end

      EquineEventApiSchema.subscriptions.trigger(
        :timer_deleted, { event_id: }, { timer_id: id }
      )

      result
    end
  end
end
