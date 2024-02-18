# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id                :uuid             not null, primary key
#  event_id          :uuid             not null
#  preset_id         :uuid             not null
#  current_phase_id  :uuid
#  previous_phase_id :uuid
#  label             :string
#  phase_expires_at  :datetime
#  paused_at         :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_timers_on_current_phase_id   (current_phase_id)
#  index_timers_on_event_id           (event_id)
#  index_timers_on_preset_id          (preset_id)
#  index_timers_on_previous_phase_id  (previous_phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (current_phase_id => timer_preset_phases.id)
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#  fk_rails_...  (previous_phase_id => timer_preset_phases.id)
#
class Timer < ApplicationRecord
  include Moonfire::Model

  attr_readonly :event_id, :preset_id

  belongs_to :event
  belongs_to :preset, class_name: 'TimerPreset'
  belongs_to :current_phase, class_name: 'TimerPresetPhase', optional: true
  belongs_to :previous_phase, class_name: 'TimerPresetPhase', optional: true

  before_create do
    self.current_phase ||= preset.phases.first!
    self.phase_expires_at = Time.current + current_phase.duration
  end

  # @!method self.active
  #   Returns active timers.
  #   (i.e. timers that are not paused and have not ended.)
  #   @return [Class<Timer>]
  scope :active, -> { where.not(current_phase: nil).where(paused_at: nil) }

  # @!method self.phase_expired
  #   Returns timers with expired phases.
  #   @return [Class<Timer>]
  scope :phase_expired, -> { where(arel_table[:phase_expires_at].lteq(bind_param('phase_expires_at', Time.current))) }

  # Creates a duplicate of the timer with an offset added to the phase expiration time.
  #
  # @param offset [ActiveSupport::Duration]
  # @return [Timer]
  def dup_with_offset(offset)
    dup.tap do |timer|
      timer.phase_expires_at += offset
    end
  end

  # Determines if the timer is active.
  # (i.e. not paused and not ended.)
  #
  # @return [Boolean]
  def active?
    !ended? && !paused?
  end

  # Determines if the timer has completely expired.
  # (i.e. all phases have expired and there are no more phases to move to.)
  #
  # @return [Boolean]
  def ended?
    persisted? && current_phase.nil?
  end

  # Checks if the timer is paused.
  #
  # @return [Boolean]
  def paused?
    paused_at.present?
  end

  # Pauses the timer.
  # If the timer is already paused, nothing happens.
  #
  # Returns false if the timer has ended.
  #
  # @return [Boolean]
  def pause!
    return false if ended? || paused?

    update!(paused_at: Time.current)
  end

  # Unpauses the timer.
  # If the timer is not paused, nothing happens.
  #
  # @return [Boolean]
  def unpause!
    return false unless paused?

    self.phase_expires_at += Time.current - paused_at
    self.paused_at = nil

    save!
  end

  # Determines if the timer phase has expired.
  #
  # @return [Boolean]
  def phase_expired?
    current_phase.present? && time_remaining <= 0.0
  end

  # Advances the timer to the next phase if the current phase has expired.
  # If the timer is ended or paused, nothing happens.
  #
  # The phase must be expired in order to move to the next phase,
  # otherwise an error is raised.
  #
  # @return [Boolean]
  def move_to_next_phase!
    return false if paused? || ended?

    phase_expired? or
      raise 'Cannot move to next phase unless the current phase has expired.'

    advance_to_next_phase
    return save! if current_phase.nil?

    self.phase_expires_at += current_phase.duration

    # recurse in case we have multiple expired phases
    phase_expired? ? move_to_next_phase! : save!
  end

  # Jump to the next phase without waiting for the current phase to expire.
  # If the timer is ended or paused, nothing happens.
  #
  # @return [Boolean]
  def skip_to_next_phase!
    return false if paused? || ended?

    advance_to_next_phase
    return save! if current_phase.nil?

    update!(phase_expires_at: Time.current + current_phase.duration)
  end

  # Resets the timer to its initial state.
  #
  # @param paused [Boolean] whether the timer should be paused after resetting
  # @return [Boolean]
  def reset!(paused: false)
    self.current_phase    = preset.phases.first!
    self.previous_phase   = nil
    self.phase_expires_at = (time = Time.current) + current_phase.duration
    self.paused_at        = paused ? time : nil

    save!
  end

  # The amount of time remaining in the current phase.
  #
  # @return [Float]
  def time_remaining
    if paused?
      phase_expires_at - paused_at
    elsif current_phase
      phase_expires_at - Time.current
    else
      0.0
    end
  end
end
