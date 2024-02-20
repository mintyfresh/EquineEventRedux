# frozen_string_literal: true

module TimerPhaseable
  extend ActiveSupport::Concern

  DURATION_MINIMUM = 10.seconds
  DURATION_UNITS = %w[seconds minutes hours].freeze

  included do
    belongs_to :audio_clip, optional: true

    validates :name, presence: true
    validates :duration_amount, numericality: { greater_than: 0 }
    validates :duration_unit, inclusion: { in: DURATION_UNITS }

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
