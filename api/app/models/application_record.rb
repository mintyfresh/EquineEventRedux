# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  extend HasUniqueAttribute
  extend WhereAny

  primary_abstract_class

  self.implicit_order_column = :created_at

  # Strips whitespace from the given attributes and prunes null bytes.
  #
  # @param attributes [Array<Symbol>] the attributes to strip
  # @param with [Symbol] the method to use for stripping whitespace
  # @param prune_null_bytes [Boolean] whether to prune null bytes
  # @return [void]
  def self.strips_whitespace_from(*attributes, with: :strip, prune_null_bytes: true)
    with.in?(%i[strip lstrip rstrip squish]) or
      raise(ArgumentError, "unknown whitespace stripping method: #{with.inspect}")

    normalizes(*attributes, with: lambda { |value|
      value = value.send(with)
      value = value.tr("\u0000", '') if prune_null_bytes

      value
    })
  end
end
