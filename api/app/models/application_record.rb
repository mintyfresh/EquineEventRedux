# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  extend WhereAny

  primary_abstract_class
end
