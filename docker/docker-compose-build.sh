# Deploy developement app
docker compose -p "acme-explorer-api-dev" --env-file .env up --build -d

#build only one service
#docker compose up -d --force-recreate --no-deps --build json-server 

chmod 777 -R .

exit

echo "Please wait 30 seconds while mongo db is initialized"
sleep 30

#create administrator user
sh create-administrator-user.sh

sleep 5

#populate collections
sh populate-collections.sh
