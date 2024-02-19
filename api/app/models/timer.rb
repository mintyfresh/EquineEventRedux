# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  preset_id  :uuid             not null
#  label      :string
#  expires_at :datetime
#  paused_at  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_timers_on_event_id   (event_id)
#  index_timers_on_preset_id  (preset_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#
class Timer < ApplicationRecord
  include Moonfire::Model

  attr_readonly :event_id, :preset_id

  belongs_to :event
  belongs_to :preset, class_name: 'TimerPreset'

  has_many :phases, -> { ordered }, class_name: 'TimerPhase', dependent: :destroy, inverse_of: :timer

  before_create do
    self.expires_at ||= (paused_at || Time.current) + preset.total_duration
    self.phases = preset.phases.map { |phase| TimerPhase.build_from_preset_phase(phase) } if phases.none?
  end

  # @!method self.active
  #   Returns active timers.
  #   (i.e. timers that are not paused and have not expired.)
  #   @return [Class<Timer>]
  scope :active, -> { not_paused.not_expired }

  # @!method self.paused
  #   Returns paused timers.
  #   @return [Class<Timer>]
  scope :paused, -> { where.not(paused_at: nil) }

  # @!method self.not_paused
  #   Returns timers that are not paused.
  #   @return [Class<Timer>]
  scope :not_paused, -> { where(paused_at: nil) }

  # @!method self.expired
  #   Returns timers that have expired.
  #   @return [Class<Timer>]
  scope :expired, lambda {
    where(arel_table[:expires_at].lteq(bind_param('expires_at', Time.current)))
  }

  # @!method self.not_expired
  #   Returns timers that have not expired.
  #   @return [Class<Timer>]
  scope :not_expired, lambda {
    where(arel_table[:expires_at].gt(bind_param('expires_at', Time.current)))
  }

  # The currently active phase, if any.
  #
  # @param at [Time] the time at which to calculate the phase
  # @return [TimerPresetPhase, nil]
  def current_phase(at = Time.current)
    phases.find { |phase| phase.interval.cover?(time_elapsed(at)) }
  end

  # Creates a duplicate of the timer with an offset added to the expiration time.
  #
  # @param offset [ActiveSupport::Duration]
  # @return [Timer]
  def dup_with_offset(offset)
    dup.tap do |timer|
      timer.expires_at += offset
      timer.phases = phases.map(&:dup)
    end
  end

  # Determines if the timer is active.
  # (i.e. not paused and not expired.)
  #
  # @param at [Time] the time at which to check for activiteness
  # @return [Boolean]
  def active?(at = Time.current)
    !paused? && !expired?(at)
  end

  # Determines if the timer has expired.
  #
  # @param at [Time] the time at which to check for expiration
  # @return [Boolean]
  def expired?(at = Time.current)
    expires_at <= at
  end

  # Checks if the timer is paused.
  #
  # @return [Boolean]
  def paused?
    paused_at.present?
  end

  # Whether the timer can be paused.
  #
  # @param at [Time] the time at which to check for pausability
  # @return [Boolean]
  def pausable?(at = Time.current)
    !expired?(at) && !paused?
  end

  # Whether the timer can be unpaused.
  #
  # @return [Boolean]
  def unpausable?
    paused?
  end

  # Pauses or unpauses the timer.
  #
  # @param value [Boolean]
  # @return [void]
  def paused=(value)
    if ActiveRecord::Type.lookup(:boolean).cast(value)
      self.paused_at = Time.current if pausable?
    elsif unpausable?
      self.paused_at = nil
    end
  end

  # Pauses the timer.
  # If the timer is already paused or expired, nothing happens.
  #
  # @return [Boolean]
  def pause!
    pausable? && update!(paused_at: Time.current)
  end

  # Unpauses the timer.
  # If the timer is not paused, nothing happens.
  #
  # @return [Boolean]
  def unpause!
    return false unless unpausable?

    # Adjust the expiry by the amount of time the timer was paused.
    self.expires_at += Time.current - paused_at
    self.paused_at   = nil

    save!
  end

  # Jump to the next phase without waiting for the current phase to expire.
  # If the timer is expired or paused, nothing happens.
  #
  # @return [Boolean]
  def skip_to_next_phase!
    return false if paused? || expired?

    self.expires_at -= time_remaining_in_phase

    save!
  end

  # Resets the timer to its initial state.
  #
  # @param paused [Boolean] whether the timer should be paused after resetting
  # @return [Boolean]
  def reset!(paused: false)
    self.expires_at = (time = Time.current) + preset.total_duration
    self.paused_at  = paused ? time : nil

    save!
  end

  # The total duration of the timer.
  #
  # @return [ActiveSupport::Duration]
  def total_duration
    phases.sum(0.seconds, &:duration)
  end

  # The total duration of the timer in seconds.
  #
  # @return [Integer]
  def total_duration_in_seconds
    total_duration.seconds.to_i
  end

  # The amount of time that has elapsed since the timer started.
  #
  # @param at [Time] the time at which to calculate the time elapsed
  # @return [Float]
  def time_elapsed(at = Time.current)
    total_duration_in_seconds - time_remaining(at)
  end

  # The amount of time remaining on the timer.
  #
  # @param at [Time] the time at which to calculate the remaining time
  # @return [Float]
  def time_remaining(at = Time.current)
    (expires_at - (paused_at || at)).clamp(0, Float::INFINITY)
  end

  # The amount of time remaining in the current phase.
  #
  # @param at [Time] the time at which to calculate the remaining time
  # @return [Float]
  def time_remaining_in_phase(at = Time.current)
    if (phase = current_phase(at))
      time_remaining(at) - phase.offset_from_end
    else
      0.0
    end
  end
end
