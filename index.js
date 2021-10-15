const fs = require("fs");
const { MongoClient } = require("mongodb");

/* host, port, rs, and default auth db */
const MONGO_PORT = 27017;
const MONGO_CLUSTER_ENDPOINT =
  process.env.NODE_ENV !== "development"
    ? process.env.MONGO_CLUSTER_ENDPOINT
    : "localhost";
const REPLICA_SET =
  process.env.NODE_ENV !== "development" ? process.env.REPLICA_SET : "none";
const MONGO_SUPER_AUTH_DB = "admin";

/* superuser username, and superuser passswor */
const MONGO_SUPER_USERNAME =
  process.env.NODE_ENV !== "development"
    ? process.env.MONGO_SUPER_USERNAME
    : null;
const MONGO_SUPER_PASSWORD =
  process.env.NODE_ENV !== "development"
    ? process.env.MONGO_SUPER_PASSWORD
    : null;

const connectionString =
  process.env.NODE_ENV !== "development"
    ? `mongodb://${MONGO_SUPER_USERNAME}:${MONGO_SUPER_PASSWORD}@${MONGO_CLUSTER_ENDPOINT}:${MONGO_PORT}` +
      `/?authSource=admin&replicaSet=${REPLICA_SET}&retryWrites=false`
    : `mongodb://${MONGO_CLUSTER_ENDPOINT}:${MONGO_PORT}?retryWrites=false`;

console.log(process.env)

async function create_app_DB_credentials(database) {
  let appCredentials = {};
  const regexp = /MONGO_[^_]*APP*/;
  Object.keys(process.env)
    .filter((envName) => regexp.test(envName))
    .forEach((envName) => {
      appCredentials[envName.split("_")[1]] = {
        ...appCredentials[envName.split("_")[1]],
        [envName.split("_")[2]]: process.env[envName],
      };
    });

    
  const remove_users_promises = Object.keys(appCredentials).map(
    async (appName) => {
      console.log(`Removing credentials for app ${appName}`);
      return database.removeUser(appCredentials[appName]["USERNAME"]);
    }
  );
  const usersRemoved = await Promise.allSettled(remove_users_promises);
  console.log(usersRemoved)
    console.log("here!")
  const promises = Object.keys(appCredentials).map(async (appName) => {
    console.log(`Creating credentials for app ${appName}`);
    let roles = [{ role: "readWrite", db: appCredentials[appName]["DB"] }];
    if (appName === "AUTHAPP")
      roles.push({
        role: "readWrite",
        db: process.env.MONGO_ACCOUNTAPP_DB,
      });
    return database.addUser(
      appCredentials[appName]["USERNAME"],
      appCredentials[appName]["PASSWORD"],
      {
        roles: roles,
      }
    );
  });
  return Promise.allSettled(promises);
}

async function initialize_DB() {
  let connectedClient = null;
  try {
    const mongodb_client = new MongoClient(connectionString, {
      useUnifiedTopology: true,
    });
    console.log(connectionString);

    connectedClient = await mongodb_client.connect();
    const database = connectedClient.db(MONGO_SUPER_AUTH_DB);
    const credentialed_apps = await create_app_DB_credentials(database);
    console.log(credentialed_apps);
    await connectedClient.close();
    console.log("Closed client");
    console.log("🦄 Successfully created users");
    return 0;
  } catch (error) {
    console.log("Could not create users");
    console.log(error);
    connectedClient.close().then(
      () => console.log("Closed client"),
      (error) => console.log(`Could not close client ${error}`)
    );
    return 1;
  }
}
initialize_DB();
