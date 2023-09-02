import { config } from 'dotenv';
import { Client } from './Client.js';
import { API } from './API.js';

config({ path: '../.env' });

const client = await new Client().start();
new API(client).start();
