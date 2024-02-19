# frozen_string_literal: true

RSpec.shared_examples_for TimerPhaseable do
  it 'is invalid without a name' do
    subject.name = nil
    expect(subject).to be_invalid
  end

  it 'is invalid without a duration amount' do
    subject.duration_amount = nil
    expect(subject).to be_invalid
  end

  it 'is invalid with a non-positive duration amount' do
    subject.duration_amount = 0
    expect(subject).to be_invalid
  end

  it 'is invalid without a duration unit' do
    subject.duration_unit = nil
    expect(subject).to be_invalid
  end

  it 'is invalid with an unknown duration unit' do
    subject.duration_unit = 'unknown'
    expect(subject).to be_invalid
  end

  it 'is invalid with a duration less than 10 seconds' do
    subject.duration_amount = 1
    subject.duration_unit = 'seconds'
    expect(subject).to be_invalid
  end
end
