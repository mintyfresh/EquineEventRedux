# frozen_string_literal: true

module Sources
  class Association < BaseSource
    # @param model [Class<ActiveRecord::Base>]
    # @param association [Symbol]
    def initialize(model, association)
      super()

      @model       = model
      @association = association
    end

    # @param record [ActiveRecord::Base]
    # @return [Integer]
    def result_key_for(record)
      record.object_id
    end

    # @param records [Array<ActiveRecord::Base>]
    # @return [Array]
    def fetch(records)
      ActiveRecord::Associations::Preloader.new(
        records:, associations: [@association]
      ).call

      records.map(&@association)
    end
  end
end
