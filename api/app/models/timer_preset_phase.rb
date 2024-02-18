# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_preset_phases
#
#  id              :uuid             not null, primary key
#  timer_preset_id :uuid             not null
#  audio_clip_id   :uuid
#  name            :string           not null
#  position        :integer          not null
#  duration_amount :integer          not null
#  duration_unit   :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_timer_preset_phases_on_audio_clip_id             (audio_clip_id)
#  index_timer_preset_phases_on_timer_preset_id           (timer_preset_id)
#  index_timer_preset_phases_on_timer_preset_id_and_name  (timer_preset_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (audio_clip_id => audio_clips.id)
#  fk_rails_...  (timer_preset_id => timer_presets.id)
#
class TimerPresetPhase < ApplicationRecord
  NAME_MAX_LENGTH = 50
  DURATION_UNITS = %w[seconds minutes hours].freeze

  belongs_to :timer_preset, counter_cache: :phases_count, inverse_of: :phases
  belongs_to :audio_clip, optional: true

  validates :name, presence: true, length: { maximum: NAME_MAX_LENGTH }
  validates :name, uniqueness: { scope: :timer_preset, if: :name_changed? }
  validates :duration_amount, numericality: { greater_than: 0 }
  validates :duration_unit, inclusion: { in: DURATION_UNITS }

  scope :ordered, -> { order(:position, :id) }

  before_create do
    self.position ||= timer_preset.next_phase_position
  end

  # Converts the duration amount and unit into an ActiveSupport::Duration.
  #
  # @return [ActiveSupport::Duration, nil]
  def duration
    duration_amount&.send(duration_unit) if duration_unit.in?(DURATION_UNITS)
  end

  # Converts the duration amount and unit into seconds.
  #
  # @return [Integer, nil]
  def duration_in_seconds
    duration&.seconds&.to_i
  end
end
