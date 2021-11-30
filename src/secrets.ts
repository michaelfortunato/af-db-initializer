import fs from "fs";
import path from "path";
import YAML from "yaml";

const baseFolder = process.env.SECRET_FOLDER_PATH as string;

const MONGO_CLUSTER_ENDPOINT = fs.readFileSync(
  path.join(baseFolder, "db-connection", "cluster-endpoint"),
  { encoding: "utf-8" }
);

const MONGO_PORT = fs.readFileSync(
  path.join(baseFolder, "db-connection", "cluster-port"),
  { encoding: "utf-8" }
);

const replicasetName = fs.readFileSync(
  path.join(baseFolder, "db-connection", "replicaset-name"),
  { encoding: "utf-8" }
);

const MONGO_ADMIN_DB = fs.readFileSync(
  path.join(baseFolder, "db-connection", "adminDB"),
  { encoding: "utf-8" }
);

const REPLICA_SET_QUERY_PARAMETER =
  replicasetName !== "" &&
  replicasetName !== undefined &&
  replicasetName !== null
    ? `&replicaSet=${replicasetName}`
    : "";

const MONGO_SUPER_USERNAME = fs.readFileSync(
  path.join(baseFolder, "users", "superuser-db-credentials", "username"),
  { encoding: "utf-8" }
);

const MONGO_SUPER_PASSWORD = fs.readFileSync(
  path.join(baseFolder, "users", "superuser-db-credentials", "password"),
  { encoding: "utf-8" }
);

const authAppCredentials = YAML.parse(
  fs.readFileSync(path.join(baseFolder, "users", "auth-app-db-credentials"), {
    encoding: "utf-8"
  })
) as {
  username: string;
  password: string;
  databases: { databaseName: string; databaseRole: string }[];
};

const accountAppCredentials = YAML.parse(
  fs.readFileSync(
    path.join(baseFolder, "users", "account-app-db-credentials"),
    { encoding: "utf-8" }
  )
) as {
  username: string;
  password: string;
  databases: { databaseName: string; databaseRole: string }[];
};

const mongodbSuperuserConnectionString =
  `mongodb://${MONGO_SUPER_USERNAME}:${MONGO_SUPER_PASSWORD}` +
  `@${MONGO_CLUSTER_ENDPOINT}:${MONGO_PORT}` +
  `/?authSource=admin${REPLICA_SET_QUERY_PARAMETER}&retryWrites=false`;

// const mongodbSuperuserConnectionString = `mongodb://${MONGO_CLUSTER_ENDPOINT}:${MONGO_PORT}`;

const appCredentials = [authAppCredentials, accountAppCredentials];

export {
  MONGO_CLUSTER_ENDPOINT,
  MONGO_PORT,
  MONGO_ADMIN_DB,
  MONGO_SUPER_USERNAME,
  MONGO_SUPER_PASSWORD,
  REPLICA_SET_QUERY_PARAMETER,
  mongodbSuperuserConnectionString,
  appCredentials
};
