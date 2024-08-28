# frozen_string_literal: true

class AddColourToTimers < ActiveRecord::Migration[7.1]
  def change
    %i[timer_phases timer_preset_phases].each do |table|
      add_column table, :colour, :integer, null: false, default: 0x00_00_00
      add_check_constraint table, "colour BETWEEN x'000000'::integer AND x'FFFFFF'::integer"
    end

    reversible do |dir|
      dir.up do
        execute(<<-SQL.squish)
          UPDATE
            timer_preset_phases
          SET
            colour = CASE
              WHEN timer_preset_phases.position = 1 THEN x'FFC107'::integer /* Bootstrap warning */
              WHEN timer_preset_phases.position = 2 THEN x'198754'::integer /* Bootstrap success */
              WHEN timer_preset_phases.position = 3 THEN x'DC3545'::integer /* Bootstrap danger  */
            END
          FROM
            timer_presets
          WHERE
            timer_presets.id = timer_preset_phases.timer_preset_id
          AND
            timer_presets.phases_count = 3
        SQL
        execute(<<-SQL.squish)
          UPDATE
            timer_phases
          SET
            colour = timer_preset_phases.colour
          FROM
            timer_preset_phases
          WHERE
            timer_preset_phases.id = timer_phases.preset_phase_id
        SQL
      end
    end
  end
end
