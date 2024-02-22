# frozen_string_literal: true

module Types
  class TimerCloneWithExtensionInputType < BaseInputObject
    argument :extension_in_seconds, Integer, required: false
    argument :paused, Boolean, required: false do
      description 'If true, the timer will be paused after cloning'
    end
  end
end
