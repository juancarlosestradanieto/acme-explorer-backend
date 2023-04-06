#read environment variables
. ./.env

echo "ADMINISTRATOR_EMAIL"; 
echo ${ADMINISTRATOR_EMAIL}

echo "Creating initial user as explorer";

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

data=$( echo ${data} | sed 's/\\[tnr]//g' | sed 's/ //g' )
echo "data"
echo ${data}

curl -X POST \
  ${url} \
  --header 'Accept: */*' \
  --header 'Content-Type: application/json' \
  --header 'Accept-Language: es' \
  --data-raw ${data}

sleep 5

echo "Changing role to administrator";

mongoshCommand='db.actors.updateOne(
   { "email": \"'${ADMINISTRATOR_EMAIL}'\" },
   {
     \$set: { role: [\"ADMINISTRATOR\"] }
   }
)'

mongoshCommand=$( echo ${mongoshCommand} | sed 's/\\[tnr]//g' | sed 's/ //g' )

echo ${mongoshCommand}

docker exec acme-explorer-backend-mongodb-container //bin//sh -c 'mongosh '${mongoDBName}' -u '${mongoDBUser}' -p '${mongoDBPass}' --authenticationDatabase admin --eval "'${mongoshCommand}';"'