#! /bin/sh
. ./.env

ssh -i credentials/acme-explorer-backend-keypair.pem admin@${IP}