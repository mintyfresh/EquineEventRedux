# frozen_string_literal: true

module Resolvers
  class Events < RecordList['Event']
    def resolve
      super.order(created_at: :desc, id: :desc)
    end
  end
end
