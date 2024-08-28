# frozen_string_literal: true

module TimerPhaseable
  extend ActiveSupport::Concern

  # A module that provides methods for calculating the total duration and offsets of a collection of phases.
  # Intended to be included as an extension to a `has_many` association.
  module CollectionHelpers
    # Calculates the total duration of all the phases in the collection.
    #
    # @return [ActiveSupport::Duration]
    def calculate_total_duration
      filter_map { |phase| phase.duration unless phase.marked_for_destruction? }.sum(0.seconds)
    end

    # Calculates each of the phase's offsets from the start and end of the total duration.
    #
    #
    # @param total_duration [ActiveSupport::Duration]
    # @return [void]
    def calculate_offsets(total_duration = calculate_total_duration)
      time_elapsed = 0

      # Calculate each of the phase's offsets from the start and end of the total duration.
      sort_by { |phase| [phase.position, phase.created_at || Float::INFINITY] }.each do |phase|
        next if phase.marked_for_destruction?

        phase.offset_from_start = time_elapsed
        time_elapsed += phase.duration_in_seconds
        phase.offset_from_end = total_duration - time_elapsed
      end
    end
  end

  DURATION_MINIMUM = 10.seconds
  DURATION_UNITS = %w[seconds minutes hours].freeze

  COLOUR_MIN_VALUE = 0x00_00_00
  COLOUR_MAX_VALUE = 0xFF_FF_FF

  included do
    belongs_to :audio_clip, optional: true

    validates :name, presence: true
    validates :duration_amount, numericality: { greater_than: 0 }
    validates :duration_unit, inclusion: { in: DURATION_UNITS }
    validates :colour, numericality: { in: COLOUR_MIN_VALUE..COLOUR_MAX_VALUE }

    validate if: -> { duration.present? } do
      errors.add(:duration_amount, :too_short, count: DURATION_MINIMUM.inspect) if duration < DURATION_MINIMUM
    end

    scope :ordered, -> { order(:position, :id) }
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

  # Returns a range that represents the interval of time that this phase occupies in the timer.
  #
  # @return [Range<Integer>, nil]
  def interval
    offset_from_start...(offset_from_start + duration_in_seconds)
  end
end
