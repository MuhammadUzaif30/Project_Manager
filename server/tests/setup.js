const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connect = async () => {
  // Spins up a temporary, real MongoDB instance in memory — no real database,
  // no internet dependency beyond the one-time binary download, and no risk
  // to any real data. Nothing here touches your actual MONGO_URI.
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
};

const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

module.exports = { connect, closeDatabase, clearDatabase };