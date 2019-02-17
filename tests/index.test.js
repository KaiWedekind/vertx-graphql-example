import { TestSuite } from '@vertx/unit';

import { GraphQLServer } from '../src/vertx-graphql';

const suite = TestSuite.create('GraphQL Server');

suite.test('is class of GraphQLServer', (context) => {
  const name = GraphQLServer.prototype.constructor.name;
  context.assertEquals(name, 'GraphQLServer');
});

suite.run();
