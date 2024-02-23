# frozen_string_literal: true

module Types
  class TimerCloneWithExtensionInputType < BaseInputObject
    argument :extension_in_seconds, Integer, required: true do
      description 'The number of seconds to extend the current phase of the timer by'
    end
    argument :match_id, ID, required: false do
      description 'The ID of the match to add the timer to'
    end
    argument :paused, Boolean, required: false do
      description 'If true, the timer will be paused after cloning'
    end
  end
end
