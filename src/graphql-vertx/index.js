/// <reference types="@vertx/web" />
/// <reference types="@vertx/core/runtime" />
// @ts-check

import {
  Router,
  BodyHandler,
  StaticHandler
} from '@vertx/web';

import {
  graphql,
  buildSchema
} from 'graphql';

import { renderOverview } from './render-overview';
import { renderGraphiQL } from './render-graphiql';
import { renderPlayground } from './render-playground';

import {
  parseBody
} from './parse-body';

const getGraphQLParams = (ctx) => {
  return parseBody(ctx)
    .then(({ error, data }) => {
      return { error, data };
    });
}

const graphqlVertx = ({ schema, resolvers, context }) => {
  return (ctx) => {
    const request = ctx.request();
    const response = ctx.response();

    return getGraphQLParams(ctx)
      .then((params) => {
        return params;
      })
      .then(({ error, data }) => {
        if (error) {
          return response
            .putHeader('content-type', 'application/json')
            .setChunked(true)
            .write(JSON.stringify({
              data: null,
              errors: [
                {
                  message: 'A query attribute must be specified and must be a string.'
                }
              ]
            }))
            .end();
        }

        const requestString = data.query;
        const contextValue = context;
        const variableValues = data.variables;
        const operationName = data.operationName;

        var rootValue = {
          ...resolvers.Query,
          ...resolvers.Mutation,
          ...resolvers.Subscription
        };

        graphql(
          schema,
          requestString,
          rootValue,
          contextValue,
          variableValues,
          operationName
        ).then((resolvedData) => {
          if (resolvedData.errors) {
            return response
              .putHeader('content-type', 'application/json')
              .setChunked(true)
              .write(JSON.stringify({
                errors: resolvedData.errors
              }))
              .end();
          }

          return response
            .putHeader('content-type', 'application/json')
            .setChunked(true)
            .write(JSON.stringify(resolvedData))
            .end();
        });
      });
  }
}

const overviewHandler = (options) => {
  if (!options || typeof options !== 'object') {
    throw new Error('GraphQL middleware requires options.');
  }

  const html = renderOverview({
    ENDPOINT: options.endpoint,
    GRAPHIQL: options.graphiql,
    PLAYGROUND: options.playground
  });

  return (ctx) => {
    return ctx.response()
      .putHeader('content-type', 'text/html')
      .setChunked(true)
      .write(html)
      .end()
  }
}

const graphiqlHandler = (options) => {
  if (!options || typeof options !== 'object') {
    throw new Error('GraphQL middleware requires options.');
  }

  const html = renderGraphiQL({
    ENDPOINT: options.endpoint,
    SUBSCRIPTIONS: options.subscriptions,
    GRAPHIQL_UI: options.graphiqlUI
  });

  return (ctx) => {
    return ctx.response()
      .putHeader('content-type', 'text/html')
      .setChunked(true)
      .write(html)
      .end()
  }
}

const playgroundHandler = (options) => {
  if (!options || typeof options !== 'object') {
    throw new Error('GraphQL middleware requires options.');
  }

  const html = renderPlayground({
    ENDPOINT: options.endpoint,
    SUBSCRIPTIONS: options.subscriptions
  });

  return (ctx) => {
    return ctx.response()
      .putHeader('content-type', 'text/html')
      .setChunked(true)
      .write(html)
      .end()
  }
}

class GraphQLServer {
  constructor({ typeDefs, resolvers, context }) {
    this.schema = buildSchema(typeDefs);
    this.resolvers = resolvers;
    this.context = context;
  }

  start({
    port,
    endpoint,
    graphiql,
    playground,
    subscriptions,
    graphiqlUI
  }, done) {
    const app = Router.router(vertx);

    app.route().handler(BodyHandler.create().handle);
    app.route().handler(StaticHandler.create().handle);

    endpoint = endpoint || '/graphql'

    if (typeof endpoint === 'string') {
      endpoint = (endpoint[0] === '/')
        ? endpoint
        : `/${endpoint}`;
    } else {
      endpoint = '/graphql';
    }

    if (typeof playground === 'string') {
      playground = (playground[0] === '/')
        ? playground
        : `/${playground}`;
    } else {
      playground = '/playground';
    }

    app.post(endpoint).handler(graphqlVertx({
      schema: this.schema,
      resolvers: this.resolvers,
      context: this.context
    }));

    if (typeof graphiql === 'string') {
      app.get(graphiql).handler(graphiqlHandler({ 
        endpoint: endpoint,
        subscriptions: subscriptions || '',
        graphiqlUI: graphiqlUI
      }));
    }

    if (typeof playground === 'string') {
      app.get(playground).handler(playgroundHandler({ 
        endpoint: endpoint,
        subscriptions: subscriptions || ''
      }));
    }

    app.get('/').handler(overviewHandler({ 
      endpoint: endpoint,
      graphiql: graphiql,
      playground: playground
    }));
    
    const server = vertx.createHttpServer()
      
    server.requestHandler((result) => {
      return app.accept(result);
    });

    server.listen(port, done);
  }
}

module.exports = { 
  GraphQLServer
};
