# frozen_string_literal: true

module TimerEvent
  CREATE = :create
  UPDATE = :update
  PAUSE = :pause
  UNPAUSE = :unpause
  SKIP_TO_NEXT_PHASE = :skip_to_next_phase
  ENDED = :ended
  RESET = :reset
  SYNC = :sync

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
