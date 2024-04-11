# frozen_string_literal: true

module Types
  class EventCreateInputType < BaseInputObject
    one_of

    argument :swiss, SwissEventCreateInputType, required: false
    argument :single_elimination, SingleEliminationEventCreateInputType, required: false

    # @return [Hash]
    def prepare
      super.values.first
    end
  end
end
