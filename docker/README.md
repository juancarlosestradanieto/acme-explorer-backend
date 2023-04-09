# Deploying the application

## 1 - Getting firebase credentials

* Go to firebase console and create a new project.
* Set the name of the project and disable the option "Enable Google Analytics for this project", then click on "Create project" button.
* You'll have to wait some seconds while the project is created.
* Once project is successfully created, click on "Continue".
* In the nav at the left, next to "Project overview", you'll find the option to go to "Project settings", then go to "Service Accounts" tab 
* If there is no any service account, youll have to create one.
* Once service account is successfully created, make sure <code>Node.js</code> sdk is selected and click on the button "Generate new private key".
* In the popup with the warning, click on "Generate key" button.
* Set the destination folder and name of the json file to <code>path-to-backend-repository/docker/credentials/firebase-service-account.json</code>.
* Now go to "General" tab, scroll down, and click on the button <code></></code> to create a web app.
* Set the name of the app and click on the button "Register app".
* Once the app is created, a snipet of code will be shown with the configuration that must be used in the frontend app.
* Copy the variably <code>firebaseConfig</code> and its value to a file in in <code>path-to-backend-repository/docker/credentials/firebase-web-app.js</code>
* Click on button "Continue to console", that action will drive you back to "General" project settings tab.
* In the nav at the left, click on "Build", then click on "Authentication", then click on "Get started" button.
* Go to "Sign in method" tab.
* Click on "Email/Password" option, this action will drive you to the specific page of email and password authentication option.
* Enable "Email/Password" authentication, then click on "Save" button.
* Now you can go to the "Users" tab, there will appear the users authenticated from backend and frontend. 

## 2 - Configure backend

Configure backend environment variables based in <code>docker/.env.example</code>.

```
cd docker
cp .env.example .env
```

Special considerations.

* Avoid using <code>$</code> symbol in any variable value because it will cause scripts to fail.
* <code>ADMINISTRATOR_EMAIL</code> variable must be a valid email.
* <code>ADMINISTRATOR_PASSWORD</code> variable must have at least 10 characters.
* The values of variables in the section "#FIREBASE PROJECT SERVICE ACCOUNT JSON" must be filled with the values in the file <code>path-to-backend-repository/docker/credentials/firebase-service-account.json</code>.
* The variable <code>FIREBASE_ADMIN_PRIVATE_KEY</code> is the only variable that must be contained within a pair of double quotation marks, otherwise, it will cause scripts to fail.
* The variable <code>FIREBASE_FRONTEND_WEB_APP_API_KEY</code> must be filled with the value of <code>firebaseConfig.apiKey</code> in file <code>path-to-backend-repository/docker/credentials/firebase-web-app.js</code>.

## 3 - Build docker container

In windows use a <code>git bash</code> terminal to run: 

```
cd docker
sh docker-compose-build.sh
```

What this script does is:

* Creates the containers.
* Creates and administrator user in the app.
* Creates these files inside the container and populate the database with them.
    ```
    ./massiveLoad/1-actors.json
    ./massiveLoad/2-trips.json
    ./massiveLoad/3-applications.json
    ./massiveLoad/4-finders.json
    ```
* When the process finishes you'll see the swagger docs url and the administrator user token to test the endpoints.
* You also can connect to the database with any mongo client, e.g: MongoDB Compass.

## 4 - Configure frontend

Use values in the file <code>path-to-backend-repository/docker/credentials/firebase-web-app.js</code> to set frontend's <code>.env</code> variables.

## 5 - Eliminate all containers.

```
cd docker
sh docker-compose-destroy.sh
```
