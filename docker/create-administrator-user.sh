#read environment variables
. ./.env.dev

echo ${ADMINISTRATOR_EMAIL}

url='http://localhost:'${PORT}'/v1/actors'
echo "url"
echo ${url}

data='{
	"name": "ExplorerOriginalName",
	"surname": "ExplorerOriginalSurname",
	"email": "'${ADMINISTRATOR_EMAIL}'",
	"password": "'${ADMINISTRATOR_PASSWORD}'",
	"language": "SPANISH",
	"phone_number": "+34612345678",
	"address": "myAddress",
    "isActive": true,
	"role": "EXPLORER"
}'

CleanData=$( echo ${data} | sed 's/\\[tnr]//g' | sed 's/ //g' )
echo "CleanData"
echo ${CleanData}
echo ${CleanData} > test.json

#exit

#create user administrator
curl -X POST \
  ${url} \
  --header 'Accept: */*' \
  --header 'Content-Type: application/json' \
  --header 'Accept-Language: es' \
  --data-raw ${CleanData}

echo "falta hacer que ahora el usuario sea de tipo administrador"

#docker exec -it mongoContainer mongosh

#docker-compose exec mongo_container_name /bin/bash -c 'mongo database_name -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase admin --eval "db.dropDatabase();"'
