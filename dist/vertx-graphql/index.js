/// <reference types="@vertx/web" />
/// <reference types="@vertx/core/runtime" />
// @ts-check

import { BodyHandler, } from '@vertx/web';
import { graphql, buildSchema } from 'graphql';
import { renderGraphiQL } from './render-graphiql';
import { renderPlayground } from './render-playground';
import { parseBody } from './parse-body';
import {
  themesGraphiQL,
  themesPlayground
} from './themes';

const getGraphQLParams = (ctx) => {
  return parseBody(ctx)
    .then(({ error, data }) => {
      return { error, data };
    });
}

const graphqlVertx = ({ schema, resolvers, context }, introspection) => {
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

          if (introspection === false) {
            if (resolvedData &&
                resolvedData.data &&
                (resolvedData.data.__schema || resolvedData.data.__type)) {
                  return response
                    .putHeader('content-type', 'application/json')
                    .setChunked(true)
                    .write()
                    .end();
            } else {
              return response
                .putHeader('content-type', 'application/json')
                .setChunked(true)
                .write(JSON.stringify(resolvedData))
                .end();
            }
          } else {
            return response
              .putHeader('content-type', 'application/json')
              .setChunked(true)
              .write(JSON.stringify(resolvedData))
              .end();
          }
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
    SUBSCRIPTIONS: options.subscriptions,
    THEME: options.theme,
    INTROSPECTION: options.introspection,
    DEFAULT: options.defaultQuery
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
    SUBSCRIPTIONS: options.subscriptions,
    THEME: options.theme,
    TABS: JSON.stringify(options.tabs, null, 2),
    INTROSPECTION: options.introspection
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
  constructor({
    typeDefs,
    resolvers,
    context,
    introspection,
    playground,
    graphiql,
    tracing
  }) {
    this.schema = buildSchema(typeDefs);
    this.resolvers = resolvers;
    this.context = context;
    this.graphqlPath = '';
    this.subscriptionsPath = '';
    this.introspection = introspection;
    this.playground = playground;
    this.graphiql = graphiql;
    this.tracing = tracing;
  }

  applyMiddleware({ app, path = '/graphql' }) {
    if (!app) {
      throw new Error('app is not defined')
    }
    
    this.graphqlPath = path;
    this.subscriptionsPath = '/subscriptions';

    if (typeof path === 'string') {
      path = (path[0] === '/')
        ? path
        : `/${path}`;
    } else {
      path = '/graphql';
    }

    const env = JSON.parse(JSON.stringify(process.env));
    const playground = this.playground;
    const graphiql = this.graphiql;
    const introspection = this.introspection;

    app.post(path).handler(BodyHandler.create().handle);

    app.post(path).handler(graphqlVertx({
      schema: this.schema,
      resolvers: this.resolvers,
      context: this.context
    }, introspection));

    if (graphiql && !playground) {
      app.get(path).handler(graphiqlHandler({ 
        endpoint: path,
        subscriptions: this.subscriptionsPath || '',
        theme: graphiql &&
               graphiql.settings &&
               themesGraphiQL.includes(graphiql.settings['editor.theme']) ? graphiql.settings['editor.theme']: null,
        introspection: this.introspection === false ? null: undefined,
        defaultQuery: graphiql &&
                      graphiql.defaultQuery ? graphiql.defaultQuery: null
      }));
    } else if (playground) {
      app.get(path).handler(playgroundHandler({ 
        endpoint: path,
        subscriptions: this.subscriptionsPath || '',
        theme: playground &&
               playground.settings &&
               themesPlayground.includes(playground.settings['editor.theme']) ? playground.settings['editor.theme']: null,
        tabs: playground &&
              playground.tabs &&
              Array.isArray(playground.tabs) &&
              playground.tabs.length ? playground.tabs: null,
        introspection: this.introspection === false ? null: undefined
      }));
    } else {
      if (env.ES4X_ENV !== 'production') {
        if (playground !== false) {
          app.get(path).handler(playgroundHandler({ 
            endpoint: path,
            subscriptions: this.subscriptionsPath || '',
            theme: playground &&
                   playground.settings &&
                   themesPlayground.includes(playground.settings['editor.theme']) ? playground.settings['editor.theme']: null,
            tabs: playground &&
                  playground.tabs &&
                  Array.isArray(playground.tabs) &&
                  playground.tabs.length ? playground.tabs: null,
            introspection: this.introspection === false ? null: undefined
          }));
        } else if (graphiql !== false) {
          app.get(path).handler(graphiqlHandler({ 
            endpoint: path,
            subscriptions: this.subscriptionsPath || '',
            theme: graphiql &&
                   graphiql.settings &&
                   graphiql.settings['editor.theme'] &&
                   themesGraphiQL.includes(graphiql.settings['editor.theme']) ? graphiql.settings['editor.theme']: null,
            introspection: this.introspection === false ? null: undefined,
            defaultQuery: graphiql &&
                          graphiql.defaultQuery ? graphiql.defaultQuery: null
          }));
        }
      }
    }
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
