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

  # @yieldparam event [Symbol]
  # @yieldreturn [void]
  # @return [Enumerator<Symbol>]
  def self.each(&)
    all.each(&)
  end
end
