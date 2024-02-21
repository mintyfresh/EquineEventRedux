# frozen_string_literal: true

module Resolvers
  class TimerPresets < RecordList['TimerPreset']
    def resolve(**)
      super(**).order(last_used_at: :desc, total_duration: :desc, created_at: :desc, id: :desc)
    end
  end
end
