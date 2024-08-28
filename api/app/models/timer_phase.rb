# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_phases
#
#  id                   :uuid             not null, primary key
#  timer_id             :uuid             not null
#  preset_phase_id      :uuid             not null
#  audio_clip_id        :uuid
#  name                 :string           not null
#  position             :integer          not null
#  duration_amount      :integer          not null
#  duration_unit        :string           not null
#  offset_from_start    :integer          not null
#  offset_from_end      :integer          not null
#  extension_in_seconds :integer          default(0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  colour               :integer          default(0), not null
#
# Indexes
#
#  index_timer_phases_on_audio_clip_id    (audio_clip_id)
#  index_timer_phases_on_preset_phase_id  (preset_phase_id)
#  index_timer_phases_on_timer_id         (timer_id)
#
# Foreign Keys
#
#  fk_rails_...  (audio_clip_id => audio_clips.id)
#  fk_rails_...  (preset_phase_id => timer_preset_phases.id)
#  fk_rails_...  (timer_id => timers.id)
#
class TimerPhase < ApplicationRecord
  include TimerPhaseable

  belongs_to :timer, inverse_of: :phases
  belongs_to :preset_phase, class_name: 'TimerPresetPhase'

  validates :extension_in_seconds, numericality: { only_integer: true }

  # Constructs a new TimerPhase from a TimerPresetPhase.
  #
  # @param phase [TimerPresetPhase]
  # @return [TimerPhase]
  def self.build_from_preset_phase(phase)
    new(
      preset_phase:      phase,
      audio_clip:        phase.audio_clip,
      name:              phase.name,
      colour:            phase.colour,
      position:          phase.position,
      duration_amount:   phase.duration_amount,
      duration_unit:     phase.duration_unit,
      offset_from_start: phase.offset_from_start,
      offset_from_end:   phase.offset_from_end
    )
  end

  # Returns the duration of the phase, including the extension.
  #
  # @return [ActiveSupport::Duration]
  def duration
    if (value = super) && (extension = self.extension)
      value + extension
    else
      value
    end
  end

  # Returns the extension as a duration.
  #
  # @return [ActiveSupport::Duration, nil]
  def extension
    extension_in_seconds&.seconds
  end
end
