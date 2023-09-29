import { config } from 'dotenv';
import { Client } from './Client.js';

config({ path: '../.env' });

await new Client().start();
