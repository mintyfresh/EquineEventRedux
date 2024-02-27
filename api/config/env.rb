# frozen_string_literal: true

# @param key [String]
# @return [Boolean]
def ENV.enabled?(key)
  !disabled?(key)
end

# @param key [String]
# @return [Boolean]
def ENV.disabled?(key)
  value = ENV.fetch(key, nil)
  return true if value.nil?

  value.downcase.in?(%w[false f no 0])
end
