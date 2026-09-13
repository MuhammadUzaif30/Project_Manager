const mongoose = require('mongoose');
require('dotenv').config(); // Loads your real .env file

const connect = async () => {
  // Connect to your real Atlas cluster, but FORCE it into a temporary database.
  // This ensures your real project data is completely untouched and safe.
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: 'mern-issue-tracker-TEST-DB' 
  });
};

const closeDatabase = async () => {
  // Wipes the temporary test database from your cluster when finished
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

module.exports = { connect, closeDatabase, clearDatabase };