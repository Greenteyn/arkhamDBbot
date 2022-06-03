const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/";
const dbName = "arkhamDBbot";
const mongoClient = new MongoClient(url);

const dbClientConnect = async () => {
  try {
    await mongoClient.connect();
    console.log("Mongo client connected!");
  } catch (error) {
    console.log(error);
  }
};

const dbConnectClose = async () => {
  await mongoClient.close();
  console.info("Connect closed");
};

const getCollection = async (collectionName) => {
  try {
    const db = mongoClient.db(dbName);
    return (collection = db.collection(collectionName));
  } catch (error) {
    console.log(error);
  }
};

const getFromCollection = async (collectionName, search) => {
  try {
    const db = await mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    const findResult = await collection.find(search).toArray();

    return findResult;
  } catch (error) {
    console.log(error);
  }
};

const addToCollection = async (collectionName, document) => {
  try {
    const collection = await getCollection(collectionName);

    if (Array.isArray(document)) {
      await collection.insertMany(document);
    } else {
      await collection.insertOne(document);
    }
  } catch (error) {
    console.log(error);
  }
};

const dropDB = async () => {
  try {
    const db = await mongoClient.db(dbName);
    await db.dropDatabase();
  } catch (error) {
    console.log(error);
  } finally {
    console.log("DB dropped!");
  }
};

module.exports = {
  dbClientConnect,
  dbConnectClose,
  dropDB,
  getCollection,
  addToCollection,
  getFromCollection,
};
