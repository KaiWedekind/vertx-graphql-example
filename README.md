<img alt="Vertx GraphQL Logo" width="50%" src="https://user-images.githubusercontent.com/12070900/47941576-f8a5d380-deee-11e8-8338-82375cd7ccee.png">


GraphQL HTTP Server Middleware
==============================

Create a GraphQL HTTP server with [Vert.x](https://github.com/reactiverse/es4x).

## Installation

```sh
npm install --save vertx-graphql
```

## Simple Setup

```js
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
    createMessage: ({ input }, context) => {
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
```

---

[GraphQL.js](https://github.com/graphql/graphql-js)

[GraphiQL](https://github.com/graphql/graphiql)

[Themes](https://codemirror.net/theme/)

[Subscriptions](https://www.apollographql.com/docs/graphql-subscriptions/)



### Typescript

This package includes [Typescript](http://www.typescriptlang.org/) typedefinitions and your IDE should find then automatically.

When working in a project you can enable type hinting for the runtime as:

```js
/// <definition types="vertx-graphql" />
// @ts-check

// Your JavaScript / TypeScript code here...
```

## Links

* [Eclipse Vert.x](https://vertx.io)
* [ES4X](https://reactiverse.io/es4x)
