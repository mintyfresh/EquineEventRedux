# frozen_string_literal: true

namespace :timers do
  task update: :environment do
    loop do
      updated = 0

      Timer.active.phase_expired.find_each(batch_size: 10) do |timer|
        timer.move_to_next_phase!

        TimerSchema.subscriptions.trigger(
          :timer, { event_id: timer.event_id }, { event_type: TimerEvent::PHASE_CHANGE, timer: }
        )

        updated += 1
      rescue StandardError => error
        Rails.logger.error("Error moving timer to next phase: #{error.message}")
        Rails.logger.debug { error.backtrace.join("\n") }
      end

      if updated.positive?
        Rails.logger.info("Updated #{updated} timers.")
      elsif Timer.active.any?
        Rails.logger.info('No timers were updated. Sleeping for a second.')
        sleep 1
      else
        Rails.logger.info('No active timers found. Sleeping for 10 seconds.')
        sleep 10
      end
    end
  end
end
