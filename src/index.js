/// <reference types="@vertx/core/runtime" />
import { Router, StaticHandler } from '@vertx/web';
import { HttpServerOptions } from '@vertx/core/options';

import { GraphQLServer } from './vertx-graphql';

// import { GraphQLServer } from 'vertx-graphql';
// import { GraphQLServer } from '../dist/vertx-graphql';
// const { GraphQLServer } = require('./vertx-graphql');

import { resolvers, typeDefs, context } from './graphql';

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context,
  playground: {
    settings: {
      'editor.theme': 'light',
    },
    tabs: [
      {
        endpoint: '/graphql',
        query: '{ hello }',
      },
      {
        endpoint: '/graphql',
        query: '{ welcome }',
      },
      {
        endpoint: '/graphql',
        query: '{ welcome hello }',
      },
    ]
  },
  introspection: true,
  graphiql: {
    settings: {
      'editor.theme': 'solarized',
    },
    defaultQuery: '{ welcome hello }'
  }
});
const app = Router.router(vertx);

app.route('/status').handler((context) => {
  const response = context.response();
  response.putHeader("content-type", "text/plain");
  response.end("Status: 200");
});

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
