// Jest global setup: use the MongoDB given in MONGODB_URI (CI provides one),
// otherwise start a throwaway in-memory MongoDB so tests run with no local install.
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_local_runs_only';
    if (process.env.MONGODB_URI) return;
    const mongod = await MongoMemoryServer.create();
    globalThis.__MONGOD__ = mongod;
    process.env.MONGODB_URI = mongod.getUri('insy7314_test');
};
