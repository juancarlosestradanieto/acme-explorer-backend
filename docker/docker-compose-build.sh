# Deploy developement app
docker compose -p "acme-explorer-api-dev" --env-file .env.dev up --build -d

#generate massive data
docker exec -ti acme-explorer-api-container //bin//sh -c " node massiveLoad/0-generate.js "

#read environment variables
. ./.env.dev

#create user administrator
curl -X POST \
  'http://localhost:${PORT}/v1/actors' \
  --header 'Accept: */*' \
  --header 'Content-Type: application/json' \
  --header 'Accept-Language: es' \
  --data-raw '{
	"name": "ExplorerOriginalName",
	"surname": "ExplorerOriginalSurname",
	"email": ${ADMINISTRATOR_EMAIL},
	"password": ${ADMINISTRATOR_PASSWORD},
	"language": "SPANISH",
	"phone_number": "+34612345678",
	"address": "myAddress",
    "isActive": true,
	"role": "EXPLORER"
}'

#docker exec -it mongoContainer mongosh

#docker-compose exec mongo_container_name /bin/bash -c 'mongo database_name -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase admin --eval "db.dropDatabase();"'
