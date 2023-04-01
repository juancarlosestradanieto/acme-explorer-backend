# Deploying the application

## 1 - Configure environment variables based in <code>docker/.env.example</code>.

```
cd docker
cp .env.example .env
```

## 2 - Build docker container.
```
cd docker
sh docker-compose-build.sh
```

This script creates the containers.

This script also creates these files inside the container and populate the database with them.

```
./massiveLoad/1-actors.json
./massiveLoad/2-trips.json
./massiveLoad/3-applications.json
./massiveLoad/4-finders.json
```

This script also creates adnistrator user in the app.

## 3 - Eliminate all containers.

```
cd docker
sh docker-compose-destroy.sh
```