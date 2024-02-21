# frozen_string_literal: true

module Resolvers
  class AudioClips < RecordList['AudioClip']
    def resolve(**)
      super(**).order(:created_at, :id)
    end
  end
end
