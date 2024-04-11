# frozen_string_literal: true

module Types
  class SingleEliminationPairingModeType < BaseEnum
    value 'TOP_TO_BOTTOM', value: 'top_to_bottom' do
      description 'The top-ranked player is paired with the bottom-ranked player, ' \
                  'the second-ranked player is paired with the second-to-bottom-ranked player, ' \
                  'and so on.'
    end
    value 'SEQUENTIAL', value: 'sequential' do
      description 'The first player is paired with the second player, ' \
                  'the third player is paired with the fourth player, ' \
                  'and so on.'
    end
  end
end
