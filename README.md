<svg viewBox="0 0 1034 402" width="50vw" style="display: block; margin: 0.5rem auto 4rem;" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#022B37" d="M104.587 259.152L36.197 87H0l92.405 230h24.19L209 87h-35.5zM216 317h139v-34.848H249.012v-64.47h104.25v-33.106h-104.25v-64.47H355V87H216zM528.756 158.468c0-36.473-25.094-73.468-75.109-73.468H370v231h33.11V119.737h50.712c28.056 0 41.823 19.279 41.823 38.905 0 19.974-13.767 39.253-41.823 39.253h-38.513v16.673L498.956 316H542l-72.669-86.842c39.384-6.947 59.425-38.21 59.425-70.69M626.424 316v-1.737c0-10.42 2.954-20.32 7.818-28.831V119.737H702V85H530v34.737h71.232V316h25.192z"/><g fill="#E535AB"><path d="M922.425 87H882.12l-47.774 65.864L786.4 87h-70.184c21.02 27.879 58.37 81.545 83.04 115.523l-64.278 88.69c3.475 7.317 5.386 15.507 5.386 24.045V317H786.226L951.61 87h-29.185zM888.201 229.008l-34.918 48.613L881.947 317h69.837c-16.677-23.871-41.693-58.023-63.583-87.992z"/></g><g fill="#E535AB"><path d="M720 370.5c0-16.775-14.175-30.5-31.5-30.5S657 353.725 657 370.5s14.175 30.5 31.5 30.5 31.5-13.725 31.5-30.5M1034 371.5c0-16.775-14.175-30.5-31.5-30.5S971 354.725 971 371.5s14.175 30.5 31.5 30.5 31.5-13.725 31.5-30.5"/><path d="M977.015 361l-.005 20.106-264.01.06.006-20.107z"/></g><g fill="#E535AB"><path d="M720 30.5C720 13.725 705.825 0 688.5 0S657 13.725 657 30.5 671.175 61 688.5 61 720 47.275 720 30.5M1034 31.5c0-16.775-14.175-30.5-31.5-30.5S971 14.725 971 31.5 985.175 62 1002.5 62s31.5-13.725 31.5-30.5"/><path d="M977.015 21l-.005 20.106-264.01.06.006-20.107z"/></g><path fill="#E535AB" d="M994 55l20.106.007.056 294.008-20.106-.006z"/><text font-family="LucidaGrande, Lucida Grande" font-size="60" fill="#000"><tspan x="0" y="389">GraphQL</tspan></text></g></svg>

GraphQL HTTP Server Middleware
==============================

Create a GraphQL HTTP server with [Vert.x](https://github.com/reactiverse/es4x) itself.

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