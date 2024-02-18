# frozen_string_literal: true

AudioClip.find_or_create_by!(system_ref: 'begin') do |clip|
  clip.file = File.open('assets/audio_clips/begin.wav')
end

AudioClip.find_or_create_by!(system_ref: 'soft-time') do |clip|
  clip.file = File.open('assets/audio_clips/over.wav')
end

AudioClip.find_or_create_by!(system_ref: 'hard-time') do |clip|
  clip.file = File.open('assets/audio_clips/time.wav')
end

TimerPreset.find_or_create_by!(system_ref: '35-minute-builtin') do |preset|
  preset.name = '35 Minute'

  # 3 minute setup phase
  preset.phases.build(
    name:            'Setup',
    audio_clip:      AudioClip['begin'],
    position:        1,
    duration_amount: 3,
    duration_unit:   'minutes'
  )

  # 35 minute soft-time phase
  preset.phases.build(
    name:            'Time Remaining',
    audio_clip:      AudioClip['soft-time'],
    position:        2,
    duration_amount: 35,
    duration_unit:   'minutes'
  )

  # 5 minute hard-time phase
  preset.phases.build(
    name:            'Game Ends In',
    audio_clip:      AudioClip['hard-time'],
    position:        3,
    duration_amount: 5,
    duration_unit:   'minutes'
  )
end

TimerPreset.find_or_create_by!(system_ref: '45-minute-builtin') do |preset|
  preset.name = '45 Minute'

  # 3 minute setup phase
  preset.phases.build(
    name:            'Setup',
    audio_clip:      AudioClip['begin'],
    position:        1,
    duration_amount: 3,
    duration_unit:   'minutes'
  )

  # 35 minute soft-time phase
  preset.phases.build(
    name:            'Time Remaining',
    audio_clip:      AudioClip['soft-time'],
    position:        2,
    duration_amount: 45,
    duration_unit:   'minutes'
  )

  # 5 minute hard-time phase
  preset.phases.build(
    name:            'Game Ends In',
    audio_clip:      AudioClip['hard-time'],
    position:        3,
    duration_amount: 5,
    duration_unit:   'minutes'
  )
end
