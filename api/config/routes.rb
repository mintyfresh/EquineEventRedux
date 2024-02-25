# frozen_string_literal: true

Rails.application.routes.draw do
  default_url_options host: ENV.fetch('HOST', 'localhost'), port: ENV.fetch('PORT', 3000)

  post '/graphql', to: 'graphql#execute'
  mount ActionCable.server, at: '/cable'
end
