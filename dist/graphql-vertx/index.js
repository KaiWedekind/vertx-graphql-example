/// <reference types="@vertx/web" />
/// <reference types="@vertx/core/runtime" />
// @ts-check

import { graphql, buildSchema } from 'graphql';
import { renderGraphiQL } from './render-graphiql';
import { renderPlayground } from './render-playground';
import { parseBody } from './parse-body';

const getGraphQLParams = (ctx) => {
  return parseBody(ctx)
    .then(({ error, data }) => {
      return { error, data };
    });
}

const graphqlVertx = ({ schema, resolvers, context }) => {
  return (ctx) => {
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

const graphiqlHandler = (options) => {
  if (!options || typeof options !== 'object') {
    throw new Error('GraphQL middleware requires options.');
  }

  const html = renderGraphiQL({
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
    this.graphqlPath = '';
    this.subscriptionsPath = ''; 
  }

  applyMiddleware({ app, path = '/graphql', graphiql, playground }) {
    if (typeof path === 'string') {
      path = (path[0] === '/')
        ? path
        : `/${path}`;
    } else {
      path = '/graphql';
    }

    this.graphqlPath = path;
    this.subscriptionsPath = '/subscriptions'; 

    if (typeof graphiql === 'string') {
      graphiql = (graphiql[0] === '/')
        ? graphiql
        : `/${graphiql}`;
    } else {
      graphiql = '/graphiql';
    }

    if (typeof playground === 'string') {
      playground = (playground[0] === '/')
        ? playground
        : `/${playground}`;
    } else {
      playground = '/playground';
    }

    app.post(path).handler(graphqlVertx({
      schema: this.schema,
      resolvers: this.resolvers,
      context: this.context
    }));

    if (typeof graphiql === 'string') {
      app.get(graphiql).handler(graphiqlHandler({ 
        endpoint: path,
        subscriptions: this.subscriptionsPath || ''
      }));
    }

    if (typeof playground === 'string') {
      app.get(playground).handler(playgroundHandler({ 
        endpoint: path,
        subscriptions: this.subscriptionsPath || ''
      }));
    }

    // console.log('app', app);
    // console.log('path', path);
  }

  installSubscriptionHandlers(app) {
    if (typeof this.subscriptionsPath === 'string') {
      app.route(this.subscriptionsPath).handler((ctx) => {
        const request = ctx.request();
        const response = request.response();
        const headers = response.headers();
        headers.set("Sec-Websocket-Protocol", "graphql-subscriptions");
        
        request.response().putHeader('Sec-Websocket-Protocol', 'graphql-subscriptions');
        request.upgrade();
      });
    }
  }
}

module.exports = { 
  GraphQLServer
};
