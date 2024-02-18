# frozen_string_literal: true

module Resolvers
  class Event < RecordFind['Event']
    # @param id [String]
    # @return [::Event]
    def find_record_by_id(id)
      ::Event.find_by(slug: id) || super
    end
  end
end
