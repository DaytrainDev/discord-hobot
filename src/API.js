import http from 'node:http';

export class API {
  constructor(client) {
    this.client = client;
  }

  start() {
    const server = http.createServer((req, res) => {
      // TODO: build API for website

      // if (req.url === '/health') {
      res.writeHead(200);
      res.end('OK');
      // } else {
      //   res.writeHead(404);
      //   res.end();
      // }
    });
    server.listen(8080);
  }
}
