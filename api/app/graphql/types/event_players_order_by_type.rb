# frozen_string_literal: true

module Types
  class EventPlayersOrderByType < BaseEnum
    value 'NAME', value: lambda { |direction|
      Player.order(name: direction)
    }
    value 'WINS_COUNT', value: lambda { |direction|
      Player.joins(:score_card).merge(PlayerScoreCard.order(wins_count: direction)).order(id: direction)
    }
    value 'DRAWS_COUNT', value: lambda { |direction|
      Player.joins(:score_card).merge(PlayerScoreCard.order(draws_count: direction)).order(id: direction)
    }
    value 'LOSSES_COUNT', value: lambda { |direction|
      Player.joins(:score_card).merge(PlayerScoreCard.order(losses_count: direction)).order(id: direction)
    }
    value 'SCORE', value: lambda { |direction|
      Player.joins(:score_card).merge(PlayerScoreCard.order_by_score(direction)).order(id: direction)
    }

    # @return [Proc]
    def self.default_value
      values['NAME'].value
    end
  end
end
