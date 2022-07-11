# frozen_string_literal: true

module Resolvers
  class Events < RecordList['Event']
    extension Extensions::DeletedFilterExtension

    # @param deleted [Proc]
    def resolve(deleted:)
      events = super().order(created_at: :desc, id: :desc)

      deleted.call(events)
    end
  end
end
