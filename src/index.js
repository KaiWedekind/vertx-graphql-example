/// <reference types="@vertx/core/runtime" />
import { Router, StaticHandler, BodyHandler, } from '@vertx/web';
import { HttpServerOptions } from '@vertx/core/options';

// const { GraphQLServer } = require('./graphql-vertx');

import { GraphQLServer } from '../dist/graphql-vertx';

import { resolvers, typeDefs, context } from './graphql';

const server = new GraphQLServer({ typeDefs, resolvers, context });
const app = Router.router(vertx);

app.route('/hello').handler((context) => {
  const response = context.response();
  response.putHeader("content-type", "text/plain");
  response.end("Hello World from Vert.x-Web!");
});

app.route().handler(BodyHandler.create().handle);
app.route().handler(StaticHandler.create().handle);

server.applyMiddleware({
  app,
  path: '/graphql'
});

const port = process.env.PORT || 9100;
const host = process.env.HOST || '0.0.0.0';

const options = new HttpServerOptions();
console.log('options', options.getWebsocketSubProtocols())
options.setWebsocketSubProtocols('graphql-subscriptions, graphql-ws');
console.log('options', options.getWebsocketSubProtocols())
const httpServer = vertx.createHttpServer(options);

httpServer.requestHandler(app.handle);
server.installSubscriptionHandlers(app);

httpServer.listen(port, host, (res, err) => {
  if (!err) {
    console.log(`🚀 Server ready at http://${host}:${port}`)
    console.log(`🚀 GraphQL ready at http://${host}:${port}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://${host}:${port}${server.subscriptionsPath}`)
  } else {
    console.log('Failed to bind!');
  }
});
