/// <reference types="@vertx/core/runtime" />
// @ts-check

import { Router } from '@vertx/web';

const app = Router.router(vertx);
const PORT = 9100;

app.route().handler((ctx) => {
  ctx.response().end('Hello from Vert.x GraphQL!');
});

vertx.createHttpServer()
  .requestHandler((result) => {
    return app.accept(result);
  })
  .listen(PORT, () => {
    console.log('Server started')
  });