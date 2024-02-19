# frozen_string_literal: true

module Mutations
  class TimerCloneWithOffset < BaseMutation
    argument :id, ID, required: true
    argument :input, Types::TimerCloneWithOffsetInputType, required: true

    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:, input:)
      old_timer = ::Timer.find(id)

      new_timer = old_timer.dup_with_offset(input.offset_in_seconds)
      new_timer.paused = input.paused
      new_timer.save!

      EquineEventApiSchema.subscriptions.trigger(
        :timer_event, { event_id: new_timer.event_id }, { event_type: TimerEvent::CREATE, timer: new_timer }
      )

      { timer: new_timer }
    end
  end
end
