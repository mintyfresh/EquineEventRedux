# frozen_string_literal: true

module Mutations
  class TimerExtend < BaseMutation
    description 'Extends the current phase of a timer by a given duration. ' \
                'The overall duration of the timer is modified by this duration, ' \
                'and this extension is preserved even if the timer is paused or reset. ' \
                'Cannot be called on an expired timer.'

    argument :id, ID, required: true
    argument :duration_amount, Integer, required: true
    argument :duration_unit, Types::TimerPhaseDurationUnitType, required: true

    field :result, Boolean, null: true
    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:, duration_amount:, duration_unit:)
      timer    = ::Timer.find(id)
      duration = duration_amount.send(duration_unit)
      result   = timer.extend!(duration)

      { result:, timer: }
    end
  end
end
