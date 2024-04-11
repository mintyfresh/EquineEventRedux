# frozen_string_literal: true

module Types
  class SwissEventCreateInputType < BaseInputObject
    argument :name, String, required: true

    # @return [Hash]
    def prepare
      super.to_h.merge(type: 'SwissEvent')
    end
  end
end
