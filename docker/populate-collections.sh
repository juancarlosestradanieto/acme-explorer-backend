#read environment variables
. ./.env

API_BASE_URL='http://localhost:'${PORT}

echo "Populating collections"

echo "Generating massive data files"

docker exec -ti acme-explorer-backend-api-container //bin//sh -c " node massiveLoad/0-generate.js "

echo "Please wait 20 seconds while massive data is generated"
sleep 20

echo "login administrator and get custom token"

loginResponse1=$( curl -X GET \
  ${API_BASE_URL}'/v1/login?email='${ADMINISTRATOR_EMAIL}'&password='${ADMINISTRATOR_PASSWORD}'' \
  --header 'Accept: */*' \
  --header 'Accept-Language: es' )

echo $loginResponse1 > responses/loginResponse1.json

administratorCustomToken=$( awk 'BEGIN { FS="\""; RS="," }; { if ($2 == "customToken") {print $4} }' responses/loginResponse1.json )

echo "administratorCustomToken"
echo ${administratorCustomToken}

echo "verify custom token"

loginResponse2=$( curl -X POST \
'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key='${FIREBASE_FRONTEND_WEB_APP_API_KEY} \
--header 'Accept: */*' \
--header 'Accept-Language: es' \
--header 'Content-Type: application/json' \
--data-raw '{
"token": "'${administratorCustomToken}'",
"returnSecureToken": true
}' )

echo $loginResponse2 > responses/loginResponse2.json

administratorIdToken=$( awk 'BEGIN { FS="\""; RS="," }; { if ($2 == "idToken") {print $4} }' responses/loginResponse2.json )

echo "administratorIdToken"
echo ${administratorIdToken}


echo "get account info"
sleep 5

curl -X POST \
  'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key='${FIREBASE_FRONTEND_WEB_APP_API_KEY} \
  --header 'Accept: */*' \
  --header 'Accept-Language: es' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "idToken": "'${administratorIdToken}'"
}'

echo "populate actors collection"
sleep 5

curl -X POST \
  ${API_BASE_URL}'/v1/storage/fs?collection=actors&batchSize=100&parseString=*&sourceFile=./massiveLoad/1-actors.json' \
  --header 'Accept: */*' \
  --header 'idToken: '${administratorIdToken} \
  --header 'Accept-Language: es'

echo "populate trips collection"
sleep 5

curl -X POST \
${API_BASE_URL}'/v1/storage/fs?collection=trips&batchSize=100&parseString=*&sourceFile=./massiveLoad/2-trips.json' \
--header 'Accept: */*' \
--header 'idToken: '${administratorIdToken} \
--header 'Accept-Language: es'

echo "populate applications collection"
sleep 5

curl -X POST \
${API_BASE_URL}'/v1/storage/fs?collection=applications&batchSize=100&parseString=*&sourceFile=./massiveLoad/3-applications.json' \
--header 'Accept: */*' \
--header 'idToken: '${administratorIdToken} \
--header 'Accept-Language: es'

echo "populate finders collection"
sleep 5

curl -X POST \
${API_BASE_URL}'/v1/storage/fs?collection=finders&batchSize=100&parseString=*&sourceFile=./massiveLoad/4-finders.json' \
--header 'Accept: */*' \
--header 'idToken: '${administratorIdToken} \
--header 'Accept-Language: es'

echo "Start dashboardInformation job"
sleep 5
curl -X POST \
${API_BASE_URL}'/v1/dashboardInformation?rebuildPeriod=*/10 * * * * *' \
--header 'Accept: */*' \
--header 'idToken: '${administratorIdToken} \
--header 'Accept-Language: es'

echo "Start explorerStats job"
sleep 5
curl -X POST \
${API_BASE_URL}'/v1/explorerStats?rebuildPeriod=*/10 * * * * *' \
--header 'Accept: */*' \
--header 'idToken: '${administratorIdToken} \
--header 'Accept-Language: es'

echo "--------------------------------------------------------------------------"
echo "You can now interect with the api via swagger docs in "${API_BASE_URL}"/api-doc/"
echo "--------------------------------------------------------------------------"
echo "The current(it will expire) administrator user auth token is:"
echo "--------------------------------------------------------------------------"
echo ${administratorIdToken}