// Creates a least-privilege application user for the payments backend.
// The app user only needs readWrite permissions on the insy7314 database.

const appPassword = process.env.MONGO_APP_PASSWORD;
const dbName = process.env.MONGO_INITDB_DATABASE || 'insy7314';

if (!appPassword) {
  throw new Error('MONGO_APP_PASSWORD environment variable must be set to initialize application user');
}

const appDb = db.getSiblingDB(dbName);
const existingUser = appDb.getUser('insy7314_app');

if (!existingUser) {
  appDb.createUser({
    user: 'insy7314_app',
    pwd: appPassword,
    roles: [
      {
        role: 'readWrite',
        db: dbName,
      },
    ],
  });
}
