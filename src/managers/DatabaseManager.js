// const { MongoClient } = require('mongodb');
// // or as an es module:
// // import { MongoClient } from 'mongodb'

// // Connection URL
// const url = 'mongodb://localhost:27017';
// const client = new MongoClient(url);

// // Database Name
// const dbName = 'myProject';

// async function main() {
//   // Use connect method to connect to the server
//   await client.connect();
//   console.log('Connected successfully to server');
//   const db = client.db(dbName);
//   const collection = db.collection('documents');
//   console.info(collection);

//   // the following code examples can be pasted here...

//   // const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
//   // console.log('Inserted documents =>', insertResult);

//   // const filteredDocs = await collection.find({ a: 3 }).toArray();
//   // console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

//   // const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
//   // console.log('Updated documents =>', updateResult);

//   // const deleteResult = await collection.deleteMany({ a: 3 });
//   // console.log('Deleted documents =>', deleteResult);

//   // const indexName = await collection.createIndex({ a: 1 });
//   // console.log('index name =', indexName);

//   return 'done.';
// }

// // main()
// //   .then(console.log)
// //   .catch(console.error)
// //   .finally(() => client.close());

// // const client = new MongoClient(url);
// // await client.connect();
// // const collection = client.db().collection('collection');

// // try {
// //   await collection.insertOne({ _id: 1 });
// //   await collection.insertOne({ _id: 1 }); // duplicate key error
// // } catch (error) {
// //   if (error instanceof MongoServerError) {
// //     console.log(`Error worth logging: ${error}`); // special case for some reason
// //   }
// //   throw error; // still want to crash
// // }
