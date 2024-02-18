# frozen_string_literal: true

module Types
  class AudioClipType < BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :is_system, Boolean, null: false, method: :system? do
      description 'Whether this audio clip is system-defined'
    end
    field :content_type, String, null: false
    field :file_name, String, null: false
    field :file_size, Integer, null: false
    field :file_url, String, null: false

    # @!method content_type
    #   @return [String]
    delegate :content_type, to: :blob

    # @return [String]
    def file_name
      blob.filename.to_s
    end

    # @return [Integer]
    def file_size
      blob.byte_size
    end

    # @return [String]
    def file_url
      Rails.application.routes.url_helpers.rails_blob_url(blob, host: context[:host])
    end

  private

    # @return [ActiveStorage::Blob]
    def blob
      @blob ||= dataloader.with(Sources::Record, ActiveStorage::Blob, :id).load(attachment.blob_id)
    end

    # @return [ActiveStorage::Attachment]
    def attachment
      @attachment ||= begin
        scope = ActiveStorage::Attachment.where(record_type: object.class.polymorphic_name)
        dataloader.with(Sources::Record, ActiveStorage::Attachment, :record_id, scope:).load(object.id)
      end
    end
  end
end
