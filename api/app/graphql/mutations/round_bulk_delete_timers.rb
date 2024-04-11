# frozen_string_literal: true

module Mutations
  class RoundBulkDeleteTimers < BaseMutation
    argument :round_id, ID, required: true do
      description 'The ID of the round from which the timers should be deleted.'
    end
    argument :expired_only, Boolean, required: false, default_value: true do
      description 'Whether to delete only expired timers. (If false, all timers will be deleted.)'
    end

    field :round, Types::RoundType, null: true do
      description 'The round from which the timers were deleted.'
    end
    field :timer_ids, [ID], null: true do
      description 'The IDs of the timers that were deleted.'
    end
    field :errors, [Types::ErrorType], null: true

    def resolve(round_id:, expired_only: true)
      round = ::Round.find(round_id)

      timers = round.timers.lock
      timers = timers.expired if expired_only

      round.transaction do
        timer_ids = timers.pluck(:id)
        timers.destroy_all

        { round:, timer_ids: }
      end
    end
  end
end
