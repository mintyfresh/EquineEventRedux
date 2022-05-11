# frozen_string_literal: true

module Sources
  class Record < BaseSource
    # @param model [Class<ActiveRecord::Base>]
    # @param column [Symbol, String]
    # @param scope [ActiveRecord::Relation, nil]
    # @return [Array]
    def self.batch_key_for(model, column = model.primary_key, scope: nil)
      [model, column.to_sym, scope&.to_sql]
    end

    # @param model [Class<ActiveRecord::Base>]
    # @param column [Symbol, String]
    # @param scope [ActiveRecord::Relation, nil]
    def initialize(model, column = model.primary_key, scope: nil)
      super()

      @model  = model
      @column = column.to_sym
      @scope  = scope
    end

    # @param ids [Array<String, Integer>]
    # @return [Array<ActiveRecord::Base, nil>]
    def fetch(ids)
      records = @model.where_any(@column, ids)
      records = records.merge(@scope) if @scope
      records = records.index_by(&@column)

      ids.map { |id| records[id] }
    end
  end
end
