# frozen_string_literal: true

AudioClip.find_or_create_by!(system_ref: 'begin') do |clip|
  clip.name = 'We begin... now!'
  clip.file = File.open('assets/audio_clips/begin.wav')
end

AudioClip.find_or_create_by!(system_ref: 'soft-time') do |clip|
  clip.name = "It's fine..."
  clip.file = File.open('assets/audio_clips/over.wav')
end

AudioClip.find_or_create_by!(system_ref: 'hard-time') do |clip|
  clip.name = 'Great whickering stallions!'
  clip.file = File.open('assets/audio_clips/time.wav')
end

TimerPreset.find_or_create_by!(system_ref: '35-minute-builtin') do |preset|
  preset.name = '35 Minute Game'

  # 3 minute setup phase
  preset.phases.build(
    name:            'Setup',
    colour:          0xFFC107,
    audio_clip:      AudioClip['begin'],
    position:        1,
    duration_amount: 3,
    duration_unit:   'minutes'
  )

  # 35 minute soft-time phase
  preset.phases.build(
    name:            'Time Remaining',
    colour:          0x198754,
    audio_clip:      AudioClip['soft-time'],
    position:        2,
    duration_amount: 35,
    duration_unit:   'minutes'
  )

  # 5 minute hard-time phase
  preset.phases.build(
    name:            'Game Ends In',
    colour:          0xDC3545,
    audio_clip:      AudioClip['hard-time'],
    position:        3,
    duration_amount: 5,
    duration_unit:   'minutes'
  )
end

TimerPreset.find_or_create_by!(system_ref: '45-minute-builtin') do |preset|
  preset.name = '45 Minute Game'

  # 3 minute setup phase
  preset.phases.build(
    name:            'Setup',
    colour:          0xFFC107,
    audio_clip:      AudioClip['begin'],
    position:        1,
    duration_amount: 3,
    duration_unit:   'minutes'
  )

  # 35 minute soft-time phase
  preset.phases.build(
    name:            'Time Remaining',
    colour:          0x198754,
    audio_clip:      AudioClip['soft-time'],
    position:        2,
    duration_amount: 45,
    duration_unit:   'minutes'
  )

  # 5 minute hard-time phase
  preset.phases.build(
    name:            'Game Ends In',
    colour:          0xDC3545,
    audio_clip:      AudioClip['hard-time'],
    position:        3,
    duration_amount: 5,
    duration_unit:   'minutes'
  )
end

TimerPreset.find_or_create_by!(system_ref: '2-hour-builtin') do |preset|
  preset.name = '2 Hour Game'

  # 5 minute setup phase
  preset.phases.build(
    name:            'Setup',
    colour:          0xFFC107,
    audio_clip:      AudioClip['begin'],
    position:        1,
    duration_amount: 5,
    duration_unit:   'minutes'
  )

  # 2 hour game phase
  preset.phases.build(
    name:            'Time Remaining',
    colour:          0x198754,
    audio_clip:      AudioClip['hard-time'],
    position:        2,
    duration_amount: 2,
    duration_unit:   'hours'
  )
end
