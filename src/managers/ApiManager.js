import http from 'node:http';

export class ApiManager {
  constructor(client) {
    this.client = client;
  }

  start() {
    const server = http.createServer((req, res) => {
      // TODO: build API for website

      if (req.url === '/api/v0/') {
        res.writeHead(200);

        // TODO: process Api call with a service

        res.end('OK');
      } else if (req.url === '/') {
        res.writeHead(200);
        // TODO: show static html page
        res.end('OK');
      } else if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(8080);
  }
}
