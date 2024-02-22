# frozen_string_literal: true

module Mutations
  class TimerCloneWithExtension < BaseMutation
    argument :id, ID, required: true
    argument :input, Types::TimerCloneWithExtensionInputType, required: true

    field :timer, Types::TimerType, null: true
    field :errors, [Types::ErrorType], null: true

    def resolve(id:, input:)
      old_timer = ::Timer.find(id)

      new_timer = old_timer.dup_with_extension(input.extension_in_seconds)
      new_timer.paused = true if input.paused
      new_timer.save!

      { timer: new_timer }
    end
  end
end
