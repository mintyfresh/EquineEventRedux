# frozen_string_literal: true

module Mutations
  class PlayerCreate < RecordCreate['Player']
  protected

    # @param input [Types::PlayerCreateInputType]
    # @return [Player]
    def build_record(input:)
      input.event.players.build(input.to_h)
    end
  end
end
