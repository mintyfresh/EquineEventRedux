# frozen_string_literal: true

module Types
  class TimerEventTypeType < BaseEnum
    TimerEvent.each do |event|
      value(event.to_s.upcase, value: event)
    end
  end
end
