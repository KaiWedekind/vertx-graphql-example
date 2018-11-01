/// <reference types="@vertx/core/runtime" />
// @ts-check

import {
  Router,
  BodyHandler,
  StaticHandler
} from '@vertx/web';

import {
  VertxGraphQL
} from './vertx-graphql';

const app = Router.router(vertx);
const PORT = 9100;

app.route().handler(BodyHandler.create().handle);
app.route().handler(StaticHandler.create().handle);

// The GraphQL schema
const typeDefs = `
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    hello: String
    welcome: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    welcome: () => 'Welcome to Vert.x GraphQL!',
  },
  Mutation: {
    createMessage: ({ input }) => {
      return {
        id: 123,
        content: 'Content XYZ',
        author: 'Me'
      }
    }
  }
};

const context = {
  mongoDB: true
}

const graphQL = new VertxGraphQL({ typeDefs, resolvers, context });

graphQL.applyMiddleware({ 
  app, 
  graphqlEndpoint: '/graphql',
  graphiqlEndpoint: '/explorer',
  graphiqlUI: {
    // title: 'Middot Explorer',
    // favicon: './images/favicon.ico',
    // stylesheet: './css/graphiql-custom.css'
  }
});

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