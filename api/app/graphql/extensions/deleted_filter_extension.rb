# frozen_string_literal: true

module Extensions
  class DeletedFilterExtension < BaseExtension
    def apply
      field.argument :deleted, Types::DeletedFilterType,
                     required: false, default_value: Types::DeletedFilterType.default_value,
                     description: 'Filters the list of returned objects by their deleted state.'
    end
  end
end
