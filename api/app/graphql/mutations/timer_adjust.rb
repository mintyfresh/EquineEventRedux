# frozen_string_literal: true

module Mutations
  class TimerAdjust < BaseMutation
    description 'Adjusts the timer remaining on a Timer by the given duration. ' \
                'The overall duration of the timer is unchanged, just skips forward or backward in time. ' \
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
      result   = timer.adjust!(duration)

      { result:, timer: }
    end
  end
end
