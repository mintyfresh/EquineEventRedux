# frozen_string_literal: true

module Mutations
  class TimerCloneWithExtension < BaseMutation
    argument :id, ID, required: true
    argument :input, Types::TimerCloneWithExtensionInputType, required: true

    field :timer, Types::TimerType, null: true
    field :match, Types::MatchType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:, input:)
      old_timer = ::Timer.find(id)
      new_timer = old_timer.dup_with_extension(**input.to_h)
      new_timer.save!

      { timer: new_timer, match: new_timer.match }
    end
  end
end
