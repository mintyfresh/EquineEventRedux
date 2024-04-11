# frozen_string_literal: true

module Types
  class EventCreateInputType < BaseInputObject
    one_of

    argument :swiss, SwissEventCreateInputType, required: false
    argument :top_cut, TopCutEventCreateInputType, required: false

    # @return [Hash]
    def prepare
      super.values.first
    end
  end
end
