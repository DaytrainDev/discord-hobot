import { config } from 'dotenv';
import { Client } from './Client.js';
import { Api } from './Api.js';

config({ path: '../.env' });

const client = await new Client().start();
new Api(client).start();
