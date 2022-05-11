ARG RUBY_VERSION=3.1.1

FROM ruby:${RUBY_VERSION}-slim
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends gnupg2 curl lsb-release

RUN curl -L --silent https://www.postgresql.org/media/keys/ACCC4CF8.asc | APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key add - \
 && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update \
 && apt-get -y upgrade \
 && apt-get -y install --no-install-recommends libpq5 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ARG RAILS_ENV=production
ENV RAILS_ENV $RAILS_ENV

RUN addgroup --system --gid 1001 rails
RUN adduser --system --uid 1001 rails

COPY --chown=rails:rails Gemfile Gemfile.lock .

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev git \
 && bundle install --frozen --without development test -j $(nproc) \
 && apt-get -y purge --auto-remove build-essential libpq-dev git \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY --chown=rails:rails . .

ENV PORT=3000
EXPOSE $PORT

CMD ["bin/rails", "server"]

LABEL maintainer="Minty Fresh"
