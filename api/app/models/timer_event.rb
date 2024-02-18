# frozen_string_literal: true

module TimerEvent
  CREATE = :create
  UPDATE = :update
  DELETE = :delete
  PAUSE = :pause
  UNPAUSE = :unpause
  PHASE_CHANGE = :phase_change
  ENDED = :ended
  RESET = :reset

  # @return [Array<Symbol>]
  def self.all
    @all ||= constants(false).map { |name| const_get(name) }.freeze
  end

  # @!method self.each
  #   @yieldparam event [Symbol]
  #   @return [Enumerator<Symbol>]
  delegate :each, to: :all
end
