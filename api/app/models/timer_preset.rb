# frozen_string_literal: true

# == Schema Information
#
# Table name: timer_presets
#
#  id             :uuid             not null, primary key
#  name           :string           not null
#  system_ref     :string
#  phases_count   :integer          default(0), not null
#  total_duration :interval         not null
#  last_used_at   :datetime
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
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

  has_many :phases, -> { ordered }, class_name: 'TimerPresetPhase', dependent: :destroy, inverse_of: :timer_preset,
           extend: TimerPhaseable::CollectionHelpers
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

  before_save if: :phases_changed? do
    # Recalculate the total duration of all the phases.
    self.total_duration = phases.calculate_total_duration

    # Recalculate the phase offsets.
    phases.calculate_offsets(total_duration)
  end

  # @!method self.system
  #   Returns system-defined timer presets.
  #   @return [Class<TimerPreset>]
  scope :system, -> { where.not(system_ref: nil) }

  # @!method self.order_by_last_used_at(direction)
  #   Orders the timer presets by the last used at timestamp.
  #   Timer presets that have never been used are placed last either way.
  #
  #   @param direction [String] The direction to order the timer presets.
  #   @return [Class<TimerPreset>]
  scope :order_by_last_used_at, lambda { |direction|
    case direction.to_s.downcase
    when 'asc'  then order(last_used_at: :asc)
    when 'desc' then order(Arel.sql("#{connection.quote_table_name('timer_presets.last_used_at')} DESC NULLS LAST"))
    else raise ArgumentError, "Invalid direction: #{direction.inspect}"
    end
  }

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

  # Returns the total duration of all the phases in seconds.
  #
  # @return [Integer]
  def total_duration_in_seconds
    total_duration.to_i
  end

  # Determines if any of the phases have changed.
  #
  # @return [Boolean]
  def phases_changed?
    phases.any?(&:changed_for_autosave?)
  end
end
