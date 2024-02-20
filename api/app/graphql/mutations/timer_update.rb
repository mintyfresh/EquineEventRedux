# frozen_string_literal: true

module Mutations
  class TimerUpdate < RecordUpdate['Timer']
    def resolve(**)
      result = super(**)

      result
    end
  end
end
