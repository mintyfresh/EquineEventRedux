# frozen_string_literal: true

module Sources
  class Exists < BaseSource
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
    # @return [Array<Boolean>]
    def fetch(ids)
      records = @model.where_any(@column, ids)
      records = records.merge(@scope) if @scope
      records = records.distinct.pluck(@column).to_set

      ids.map { |id| records.include?(id) }
    end
  end
end
