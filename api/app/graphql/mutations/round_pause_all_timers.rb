# frozen_string_literal: true

module Mutations
  class RoundPauseAllTimers < BaseMutation
    argument :round_id, ID, required: true do
      description 'The ID of the round for which the timers should be paused.'
    end

    field :round, Types::RoundType, null: true do
      description 'The round for which the timers were paused.'
    end
    field :timers, [Types::TimerType], null: true do
      description 'The timers that were paused.'
    end
    field :errors, [Types::ErrorType], null: true

    def resolve(round_id:)
      round = ::Round.find(round_id)
      timers = round.timers.active.lock

      round.transaction do
        time = Time.current

        timers.preload(:preset).find_each do |timer|
          timer.pause!(time)
        end
      end

      { round:, timers: }
    end
  end
end
