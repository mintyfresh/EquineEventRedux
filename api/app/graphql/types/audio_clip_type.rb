# frozen_string_literal: true

module Types
  class AudioClipType < BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :is_system, Boolean, null: false, method: :system? do
      description 'Whether this audio clip is system-defined'
    end
    field :content_type, String, null: false
    field :content_type_human, String, null: false
    field :file_name, String, null: false
    field :file_size, Integer, null: false
    field :file_size_human, String, null: false
    field :file_url, String, null: false

    field :is_in_use, Boolean, null: false, resolver_method: :in_use?
    field :timer_presets, [Types::TimerPresetType], null: false

    # @!method content_type
    #   @return [String]
    delegate :content_type, to: :blob

    # @return [String]
    def content_type_human
      if (type = Mime::Type.lookup(content_type))
        type.symbol.to_s.upcase
      else
        "Unknown File Type (#{content_type})"
      end
    end

    # @return [String]
    def file_name
      blob.filename.to_s
    end

    # @return [Integer]
    def file_size
      blob.byte_size
    end

    # @return [String]
    def file_size_human
      ActiveSupport::NumberHelper.number_to_human_size(file_size)
    end

    # @return [String]
    def file_url
      Rails.application.routes.url_helpers.rails_blob_url(blob, host: context[:host])
    end

    # @return [Boolean]
    def in_use?
      dataloader.with(Sources::Exists, ::TimerPresetPhase, :audio_clip_id).load(object.id)
    end

    # @return [Array<Types::TimerPresetType>]
    def timer_presets
      phases = dataloader.with(Sources::RecordList, ::TimerPresetPhase, :audio_clip_id).load(object.id)

      dataloader.with(Sources::Record, ::TimerPreset, :id).load_all(phases.map(&:timer_preset_id).uniq)
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
