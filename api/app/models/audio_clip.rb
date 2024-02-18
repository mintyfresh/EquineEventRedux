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
class AudioClip < ApplicationRecord
  # The maximum length of the name of an audio clip.
  #
  # @type [Integer]
  NAME_MAX_LENGTH = 50

  has_many :phases, class_name: 'TimerPresetPhase', dependent: :nullify, inverse_of: :audio_clip

  has_one_attached :file

  validates :name, presence: true, length: { maximum: NAME_MAX_LENGTH }
  validates :file, attached: true, content_type: %i[aac mpeg ogg wav], size: { less_than: 5.megabytes }

  before_validation if: -> { file.attached? } do
    self.name ||= file.filename.to_s.first(NAME_MAX_LENGTH)
  end

  # @!method self.system
  #   Returns system-defined audio clips.
  #   @return [Class<AudioClip>]
  scope :system, -> { where.not(system_ref: nil) }

  # Looks up a system-defined audio clip by its system reference.
  #
  # @param system_ref [String]
  # @return [AudioClip]
  # @raise [ActiveRecord::RecordNotFound] if the audio clip is not defined by the system
  def self.[](system_ref)
    find_by!(system_ref:)
  end

  # Determines if the audio clip is system-defined.
  #
  # @return [Boolean]
  def system?
    system_ref.present?
  end
end
