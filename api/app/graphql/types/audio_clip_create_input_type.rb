# frozen_string_literal: true

module Types
  class AudioClipCreateInputType < BaseInputObject
    argument :name, String, required: false
    argument :file, ApolloUploadServer::Upload, required: true, prepare: -> (upload, _ctx) { upload&.__getobj__ }
  end
end
