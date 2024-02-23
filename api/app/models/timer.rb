# frozen_string_literal: true

# == Schema Information
#
# Table name: timers
#
#  id         :uuid             not null, primary key
#  preset_id  :uuid             not null
#  round_id   :uuid             not null
#  match_id   :uuid
#  label      :string
#  expires_at :datetime
#  paused_at  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_timers_on_match_id   (match_id) UNIQUE
#  index_timers_on_preset_id  (preset_id)
#  index_timers_on_round_id   (round_id)
#
# Foreign Keys
#
#  fk_rails_...  (match_id => matches.id)
#  fk_rails_...  (preset_id => timer_presets.id)
#  fk_rails_...  (round_id => rounds.id)
#
class Timer < ApplicationRecord
  include Moonfire::Model

  attr_readonly :preset_id, :round_id, :match_id

  belongs_to :preset, class_name: 'TimerPreset'
  belongs_to :round, inverse_of: :timers
  belongs_to :match, inverse_of: :timer, optional: true

  strips_whitespace_from :label

  has_many :phases, -> { ordered }, class_name: 'TimerPhase', dependent: :destroy, inverse_of: :timer,
           extend: TimerPhaseable::CollectionHelpers

  validate if: -> { match.present? } do
    # Ensure the match belongs to the timer's round.
    errors.add(:match, :invalid) if match.round != round
  end

  before_create do
    self.expires_at ||= (paused_at || Time.current) + preset.total_duration
    self.phases = preset.phases.map { |phase| TimerPhase.build_from_preset_phase(phase) } if phases.none?
  end

  before_create if: -> { match.present? } do
    self.label ||= "Table #{match.table} - #{match.player1.name} vs. #{match.player2&.name || 'BYE'}"
  end

  before_save if: :phases_changed? do
    # Recalculate the phase offsets.
    phases.calculate_offsets(total_duration)
  end

  after_create do
    preset.update!(last_used_at: Time.current)
  end

  after_create_commit do
    EquineEventApiSchema.subscriptions.trigger(:timer_created, { round_id: }, { timer: self })
  end

  after_update_commit if: :saved_changes? do
    EquineEventApiSchema.subscriptions.trigger(:timer_updated, { round_id: }, { timer: self })
  end

  after_destroy_commit do
    EquineEventApiSchema.subscriptions.trigger(:timer_deleted, { round_id: }, { timer_id: id })
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

  # Creates a duplicate of the timer with an extension to the current phase.
  #
  # @param extension_in_seconds [Integer] the amount of time to extend the current phase by
  # @param match_id [String, nil] the ID of the match to associate with the new timer
  # @param paused [Boolean] whether the new timer should be initially paused
  # @return [Timer]
  def dup_with_extension(extension_in_seconds:, match_id: nil, paused: false)
    dup.tap do |timer|
      timer.phases = phases.map(&:dup)

      # Add the extension to the current phase, also extending the overall expiry.
      # (Failing to extend the expiry would result in the timer extending into the past.)
      timer.current_phase.extension_in_seconds += extension_in_seconds
      timer.expires_at += extension_in_seconds

      timer.match_id = match_id
      timer.paused = true if paused
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
    expires_at <= at && !paused?
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
  # @param at [Time] the time at which to pause the timer
  # @return [Boolean]
  def pause!(at = Time.current)
    pausable? && update!(paused_at: at)
  end

  # Unpauses the timer.
  # If the timer is not paused, nothing happens.
  #
  # @param at [Time] the time at which to unpause the timer
  # @return [Boolean]
  def unpause!(at = Time.current)
    return false unless unpausable?

    # Adjust the expiry by the amount of time the timer was paused.
    self.expires_at += at - paused_at
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
    phases.calculate_total_duration
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

  # Checks if the phases have unsaved changes.
  #
  # @return [Boolean]
  def phases_changed?
    phases.any?(&:changed_for_autosave?)
  end
end
