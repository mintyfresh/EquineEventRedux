# == Schema Information
#
# Table name: timer_phases
#
#  id                :uuid             not null, primary key
#  timer_id          :uuid             not null
#  preset_phase_id   :uuid             not null
#  audio_clip_id     :uuid
#  name              :string           not null
#  position          :integer          not null
#  duration_amount   :integer          not null
#  duration_unit     :string           not null
#  offset_from_start :integer          not null
#  offset_from_end   :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_timer_phases_on_audio_clip_id    (audio_clip_id)
#  index_timer_phases_on_preset_phase_id  (preset_phase_id)
#  index_timer_phases_on_timer_id         (timer_id)
#
# Foreign Keys
#
#  fk_rails_...  (audio_clip_id => audio_clips.id)
#  fk_rails_...  (preset_phase_id => timer_preset_phases.id)
#  fk_rails_...  (timer_id => timers.id)
#
require 'rails_helper'

RSpec.describe TimerPhase, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
