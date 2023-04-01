# Deploy developement app
docker compose -p "acme-explorer-api-dev" --env-file .env.dev up --build -d

#generate massive data
docker exec -ti acme-explorer-api-container //bin//sh -c " node massiveLoad/0-generate.js "

#read environment variables
. ./.env.dev

#create administrator user
sh create-administrator-user.sh

#populate collections
echo "falta poblar las colecciones haciendo los llamados a los endpoints según los tests"