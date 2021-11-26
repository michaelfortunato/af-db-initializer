/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import { MongoClient, Db } from "mongodb";
import {
  mongodbSuperuserConnectionString,
  MONGO_ADMIN_DB,
  appCredentials
} from "./secrets";

async function createMongoUsers(database: Db) {
  /* Remove the mongo */
  await Promise.allSettled(
    appCredentials.map(({ username }) => database.removeUser(username))
  );
  return Promise.all(
    appCredentials.map(({ username, password, databases }) =>
      database.addUser(username, password, { roles: databases })
    )
  );
}

async function initializeDatabase() {
  try {
    const mongoClient = await new MongoClient(
      mongodbSuperuserConnectionString
    ).connect();
    const database = mongoClient.db(MONGO_ADMIN_DB);
    const mongoUsers = await createMongoUsers(database);
    console.log(mongoUsers);
    await mongoClient.close();
    console.log("Closed client");
    console.log("🦄 Successfully created users");
    return 0;
  } catch (error) {
    console.log("Could not create users");
    console.log(error);
    return 1;
  }
}
initializeDatabase();
