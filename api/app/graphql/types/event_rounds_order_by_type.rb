# frozen_string_literal: true

module Types
  class EventRoundsOrderByType < BaseEnum
    value 'NUMBER', value: -> (direction) { Round.order(number: direction) }

    # @return [Proc]
    def self.default_value
      values['NUMBER'].value
    end
  end
end
