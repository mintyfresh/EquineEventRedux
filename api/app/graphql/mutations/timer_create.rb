# frozen_string_literal: true

module Mutations
  class TimerCreate < RecordCreate['Timer']
    field :round, Types::RoundType, null: true do
      description 'The Round to which the Timer was added'
    end

    argument :round_id, ID, required: true do
      description 'The ID of the Round to add the Timer to'
    end

    def resolve(round_id:, **)
      round = ::Round.find(round_id)

      result = super(**) do |timer|
        timer.round = round
      end

      { **result, round: }
    end
  end
end
