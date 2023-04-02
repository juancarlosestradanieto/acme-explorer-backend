docker compose -p "acme-explorer-api-dev" down

#delete folders of logs and data
rm -rf ./logging
rm -rf ./mongodbdata
rm responses/loginResponse*.json