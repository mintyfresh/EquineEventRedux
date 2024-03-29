# frozen_string_literal: true

module Mutations
  class TimerPause < BaseMutation
    argument :id, ID, required: true

    field :result, Boolean, null: true
    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:)
      timer  = ::Timer.find(id)
      result = timer.pause!

      { result:, timer: }
    end
  end
end
