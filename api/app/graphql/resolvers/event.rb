# frozen_string_literal: true

module Resolvers
  class Event < RecordFind['Event']
    # @param id [String]
    # @return [::Event]
    def find_record_by_id(id)
      dataloader.with(Sources::Record, ::Event, :slug).load(id) || super
    end
  end
end
