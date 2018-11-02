/// <reference types="@vertx/web" />
// @ts-check

import {
  graphql,
  buildSchema
} from 'graphql';

import {
  renderGraphiQL
} from './render-graphiql';

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

const graphiqlVertx = (options) => {
  if (!options || typeof options !== 'object') {
    throw new Error('GraphQL middleware requires options.');
  }

  const html = renderGraphiQL({
    ENDPOINT_URL: options.endpointURL,
    SUBSCRIPTIONS_ENDPOINT: options.subscriptionsEndpoint,
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

class VertxGraphQL {
  constructor({ typeDefs, resolvers, context }) {
    this.schema = buildSchema(typeDefs);
    this.resolvers = resolvers;
    this.context = context;
  }

  applyMiddleware ({
    app,
    graphqlEndpoint,
    graphiqlEndpoint,
    graphiqlUI
  }) {
    if (!app) {
      throw new Error('GraphQL middleware requires app.');
    }

    graphqlEndpoint = graphqlEndpoint || '/graphql'

    if (typeof graphqlEndpoint === 'string') {
      graphqlEndpoint = (graphqlEndpoint[0] === '/')
        ? graphqlEndpoint
        : `/${graphqlEndpoint}`;
    } else {
      graphqlEndpoint = '/graphql';
    }

    app.post(graphqlEndpoint).handler(graphqlVertx({
      schema: this.schema,
      resolvers: this.resolvers,
      context: this.context
    }));

    if (typeof graphiqlEndpoint === 'string') {
      app.get(graphiqlEndpoint).handler(graphiqlVertx({ 
        endpointURL: graphqlEndpoint,
        subscriptionsEndpoint: '',
        graphiqlUI: graphiqlUI
      }));
    }
  }
}

module.exports = { 
  VertxGraphQL
};
