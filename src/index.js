import { GraphQLServer } from './graphql-vertx';

import { resolvers, typeDefs, context } from './graphql';

const server = new GraphQLServer({ typeDefs, resolvers, context });

const options = { 
  port: 9100,
  endpoint: '/graphql',
  graphiql: '/graphiql',
  playground: '/playground',
  subscriptions: `ws://localhost:9100/subscriptions`,
  graphiqlUI: {
    // title: 'Middot Explorer',
    // favicon: './images/favicon.ico',
    // stylesheet: './css/graphiql-custom.css'
  }
}

server.start(options, () => {
  console.log('Server is running on http://localhost:' + options.port);
});
