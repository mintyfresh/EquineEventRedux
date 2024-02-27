# Equine Event Redux

## Preparing the Environment

If you haven't done so already, you will need to create and populate a `.env` file at the root of this project.

 1. Create a `.env` file from the provided template

```bash
cp .env.template .env
```

 2. Generate and fill in the `SECRET_KEY_BASE` environment variable. This is required by Rails to sign and authenticate secrets. This should be a string of 128 bytes. If you have a system Ruby installation, you can generate this using:

```bash
ruby -rsecurerandom -e 'puts SecureRandom.base64(128)'
```

 3. Fill in a `POSTGRES_PASSWORD` environment variable. This is the password that will be configured for the Postgres instance. This should be a string of URL-safe characters.

### Generating a .env file with Ruby

If you have a system Ruby available, you can generate a `.env` file with the following command:

```bash
erb -r securerandom .env.template.erb > .env
```

### Access from another device

By default, the configuration assumes that EER will be accessed from the same machine that it is hosted on. If external access is required, the `HOST` environment variable should be set in the `.env` file to the domain or address of the machine that will run the server.

If your server should be used over a network, the `HOST` should be set to the address of the machine running the server on that network.
```bash
HOST=192.168.0.120 # for access from a local network
```

If your server will be accessible over the internet, the `HOST` should be set to the domain name or IP address of the server.
```bash
HOST=eer.example.com # for access over the internet
```

This host is required for the user's browser to be able to establish a websocket connection to the server. It is also used for distributing the audio files used by timers.

## Starting the Application

Once the environment is ready, start the application with docker-compose:

```bash
docker-compose up
```

You can also run the application in detached mode using:

```bash
docker-compose up -d
```

Once fully started, the application will be available at http://localhost:4500/
