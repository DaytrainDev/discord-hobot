import { MongoClient } from 'mongodb';

export class DatabaseManager {
  constructor(context) {
    this.client = context.client;
    this.mongo = new MongoClient(process.env.MONGO_DB_URL);
    this.init();
  }

  async init() {
    console.info('DatabaseManager init');
    try {
      await this.mongo.connect();
    } catch (e) {
      console.error(e);
    } finally {
      // await this.mongo.close();
      console.info('DatabaseManager init complete');
    }
  }

  // get db() {
  //   return this.db;
  // }

  uuid() {
    // eslint-disable-next-line no-bitwise, no-mixed-operators
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }

  // getUser({ id }) {
  //   return this.db.collection('users').findOne({ id });
  // }

  // setUser(data) {
  //   return this.db.collection('users').updateOne({ id: data.id }, { $set: data });
  // }

  // async createUser(data) {
  //   const collection = await this.db.collection('users');
  //   const result = await collection.insertOne({ id: data.id }, { $set: data });
  //   return result;
  // }

  // getPlayer({ id, userId }) {
  //   return this.db.collection('players').findOne({ id, userId });
  // }

  // setPlayer(data) {
  //   return this.db.collection('players').updateOne({ id: data.id }, { $set: data });
  // }

  // createPlayer(data) {
  //   return this.db.collection('players').insertOne({ id: data.id }, { $set: data });
  // }

  // deletePlayer({ id }) {
  //   return this.db.collection('players').findOneAndDelete({ id });
  // }

  getCharacter(query) {
    const characters = this.mongo.db(process.env.MONGO_DB_NAME).collection('characters');
    const results = characters.findOne({ ...query });
    return results;
  }

  async getCharacters(query) {
    const allCharacters = this.mongo.db(process.env.MONGO_DB_NAME).collection('characters');
    const characters = await allCharacters.find({ ...query });
    const characterArray = await characters.toArray?.() ?? [];
    return characterArray;
  }

  setCharacter(data) {
    const characters = this.mongo.db(process.env.MONGO_DB_NAME).collection('characters');
    return characters.updateOne({ id: data.id }, { $set: { ...data } });
  }

  async createCharacter(data) {
    const characters = this.mongo.db(process.env.MONGO_DB_NAME).collection('characters');
    const result = await characters.insertOne({ ...data });
    return result;
  }

  deleteCharacter({ id }) {
    const characters = this.mongo.db(process.env.MONGO_DB_NAME).collection('characters');
    return characters.findOneAndDelete({ ...{ id } });
  }
}
