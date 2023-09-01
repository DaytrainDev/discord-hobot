import { config } from 'dotenv';
import { Client } from './Client.js';
import http from 'node:http';

config({ path: '../.env' });

const server = http.createServer((req, res) => {
  // if (req.url === '/health') {
  res.writeHead(200);
  res.end('OK');
  // } else {
  //   res.writeHead(404);
  //   res.end();
  // }
});
server.listen(8080);

new Client().start();
