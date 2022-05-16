# frozen_string_literal: true

module Types
  class DeletedFilterType < BaseEnum
    value 'NON_DELETED', value: -> (scope) { scope.non_deleted } do
      description 'Returns only non-deleted records'
    end
    value 'DELETED', value: -> (scope) { scope.deleted } do
      description 'Returns only deleted records'
    end
    value 'ALL', -> (scope) { scope.all } do
      description 'Returns both deleted and non-deleted records'
    end

    # @return [Proc]
    def self.default_value
      @default_value ||= values['NON_DELETED'].value
    end
  end
end
