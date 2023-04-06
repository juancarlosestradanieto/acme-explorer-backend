#read environment variables
. ./.env

USER_EMAIL=test1680707388663@gmail.com
USER_PASSWORD=1234567890

API_HOST=http://localhost
API_BASE_URL=${API_HOST}':'${PORT}

echo "API_BASE_URL "${API_BASE_URL}

echo "login and get custom token"

loginResponse1=$( curl -X GET \
  ${API_BASE_URL}'/v1/login?email='${USER_EMAIL}'&password='${USER_PASSWORD}'' \
  --header 'Accept: */*' \
  --header 'Accept-Language: es' )

echo $loginResponse1 > responses/loginResponse1.json

customToken=$( awk 'BEGIN { FS="\""; RS="," }; { if ($2 == "customToken") {print $4} }' responses/loginResponse1.json )

echo "\n customToken"
echo ${customToken}

echo "verify custom token"

loginResponse2=$( curl -X POST \
'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key='${FIREBASE_FRONTEND_WEB_APP_API_KEY} \
--header 'Accept: */*' \
--header 'Accept-Language: es' \
--header 'Content-Type: application/json' \
--data-raw '{
"token": "'${customToken}'",
"returnSecureToken": true
}' )

echo $loginResponse2 > responses/loginResponse2.json

idToken=$( awk 'BEGIN { FS="\""; RS="," }; { if ($2 == "idToken") {print $4} }' responses/loginResponse2.json )

echo "\n idToken"
echo ${idToken}


echo "get account info"
sleep 5

curl -X POST \
  'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key='${FIREBASE_FRONTEND_WEB_APP_API_KEY} \
  --header 'Accept: */*' \
  --header 'Accept-Language: es' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "idToken": "'${idToken}'"
}'

echo "--------------------------------------------------------------------------"
echo "You can now interect with the api via swagger docs in "${API_BASE_URL}"/api-doc/"
echo "--------------------------------------------------------------------------"
echo "The current(it will expire) user auth idToken is:"
echo "--------------------------------------------------------------------------"
echo ${idToken}