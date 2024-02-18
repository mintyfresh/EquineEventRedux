# frozen_string_literal: true

# == Schema Information
#
# Table name: audio_clips
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  system_ref :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_audio_clips_on_system_ref  (system_ref) UNIQUE
#
FactoryBot.define do
  factory :audio_clip do
    file do
      extension = File.extname(file_path).delete_prefix('.')
      Rack::Test::UploadedFile.new(file_path, Mime::Type.lookup_by_extension(extension))
    end

    transient do
      file_path { Dir[Rails.root.join('assets/audio_clips/*.wav')].sample }
    end
  end
end
