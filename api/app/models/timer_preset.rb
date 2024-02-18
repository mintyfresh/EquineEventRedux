# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_presets
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  system_ref   :string
#  phases_count :integer          default(0), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_timer_presets_on_name        (name) UNIQUE
#  index_timer_presets_on_system_ref  (system_ref) UNIQUE
#
class TimerPreset < ApplicationRecord
  # The maximum length of the name of a timer preset.
  #
  # @type [Integer]
  NAME_MAX_LENGTH = 50
  # The minimum number of phases that a timer preset can have.
  #
  # @type [Integer]
  PHASES_MIN_COUNT = 1
  # The maximum number of phases that a timer preset can have.
  #
  # @type [Integer]
  PHASES_MAX_COUNT = 10

  has_many :phases, -> { ordered }, class_name: 'TimerPresetPhase', dependent: :destroy, inverse_of: :timer_preset
  accepts_nested_attributes_for :phases, allow_destroy: true, limit: PHASES_MAX_COUNT * 2

  validates :name, presence: true, length: { maximum: NAME_MAX_LENGTH }, uniqueness: { if: :name_changed? }
  validates :phases, length: { minimum: PHASES_MIN_COUNT, maximum: PHASES_MAX_COUNT }

  validate if: :phases_changed? do
    names = Set.new

    phases.each_with_index do |phase, index|
      next if phase.marked_for_destruction?

      if names.include?(phase.name)
        error = phase.errors.add(:name, :taken)
        errors.import(error, attribute: "phases[#{index}].#{error.attribute}")
      else
        names << phase.name
      end
    end
  end

  # @!method self.system
  #   Returns system-defined timer presets.
  #   @return [Class<TimerPreset>]
  scope :system, -> { where.not(system_ref: nil) }

  # Determines if the timer preset is system-defined.
  #
  # @return [Boolean]
  def system?
    system_ref.present?
  end

  # Generates the next position number for a new phase.
  #
  # @return [Integer]
  def next_phase_position
    (phases.reject(&:marked_for_destruction?).filter_map(&:position).max || 0) + 1
  end

  # Returns the phase after the given phase.
  # If the given phase is the last phase, then `nil` is returned.
  #
  # @param phase [TimerPresetPhase]
  # @return [TimerPresetPhase, nil]
  def phase_after(phase)
    phases.after(phase).first
  end

  # Calculates the total duration of all the phases.
  #
  # @return [ActiveSupport::Duration, nil]
  def total_duration
    phases.reject(&:marked_for_destruction?).filter_map(&:duration).sum(0.seconds)
  end

  # Calculates the total duration of all the phases in seconds.
  #
  # @return [Integer]
  def total_duration_in_seconds
    phases.reject(&:marked_for_destruction?).filter_map(&:duration_in_seconds).sum
  end

  # Determines if any of the phases have changed.
  #
  # @return [Boolean]
  def phases_changed?
    phases.any?(&:changed_for_autosave?)
  end
end