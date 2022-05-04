# frozen_string_literal: true

module Mutations
  class EventCreate < RecordCreate[::Event]
    def resolve(**)
      super do |event|
        event.rounds.build(number: 1)
      end
    end
  end
end
