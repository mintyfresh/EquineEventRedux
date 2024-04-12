# frozen_string_literal: true

module SoftDeletable
  extend ActiveSupport::Concern

  included do
    scope :deleted, -> { where.not(deleted_at: nil) }
    scope :non_deleted, -> { where(deleted_at: nil) }
  end

  class_methods do
    def after_soft_delete(**options, &)
      after_save(if: [-> { saved_change_to_deleted?(to: true) }, *options[:if]], &)
    end

    def after_restore(**options, &)
      after_save(if: [-> { saved_change_to_deleted?(to: false) }, *options[:if]], &)
    end
  end

  # @return [Boolean]
  def deleted
    deleted_at.present?
  end

  alias deleted? deleted

  # @param value [Boolean]
  # @return [void]
  def deleted=(value)
    if ActiveRecord::Type::Boolean.new.cast(value)
      return if deleted? # no-op

      self.deleted_at = Time.current
      self.deleted_in = nil
    else
      self.deleted_at = nil
    end
  end

  # @return [Boolean]
  def not_deleted
    !deleted
  end

  alias not_deleted? not_deleted

  # @return [Boolean]
  def deleted_was
    deleted_at_was.present?
  end

  # @return [Boolean]
  def deleted_before_last_save
    deleted_at_before_last_save.present?
  end

  # @param to [Boolean]
  # @param from [Boolean]
  # @return [Boolean]
  def deleted_changed?(to: :__unspecified__, from: :__unspecified__)
    deleted_at_changed? &&
      (to == :__unspecified__ || deleted == to) &&
      (from == :__unspecified__ || deleted_was == from)
  end

  # @param to [Boolean]
  # @param from [Boolean]
  # @return [Boolean]
  def saved_change_to_deleted?(to: :__unspecified__, from: :__unspecified__)
    saved_change_to_deleted_at? &&
      (to == :__unspecified__ || deleted == to) &&
      (from == :__unspecified__ || deleted_before_last_save == from)
  end

  # @param deleted_in [String]
  # @return [Boolean]
  def destroy(deleted_in: SecureRandom.uuid)
    deleted? or update(deleted: true, deleted_in:)
  end

  # @param deleted_in [String]
  # @return [Boolean]
  def destroy!(deleted_in: SecureRandom.uuid)
    deleted? or update!(deleted: true, deleted_in:)
  end

  # @return [Boolean]
  def mark_for_destruction
    self.deleted = true
  end

  # @return [Boolean]
  def marked_for_destruction?
    super || deleted_changed?(to: true)
  end

  # @return [Boolean]
  def restore
    update(deleted: false)
  end

  # @return [Boolean]
  def restore!
    update!(deleted: false)
  end
end
