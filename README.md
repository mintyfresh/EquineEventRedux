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
