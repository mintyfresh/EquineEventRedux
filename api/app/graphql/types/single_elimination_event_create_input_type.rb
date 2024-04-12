# frozen_string_literal: true

module Types
  class SingleEliminationEventCreateInputType < BaseInputObject
    argument :name, String, required: true
    argument :pairing_mode, Types::SingleEliminationPairingModeType, required: true

    # @return [Hash]
    def prepare
      super.to_h.merge(type: 'SingleEliminationEvent')
    end
  end
end
