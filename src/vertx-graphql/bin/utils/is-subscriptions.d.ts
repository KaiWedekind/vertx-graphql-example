import { DocumentNode, getOperationAST } from 'graphql';

export function isASubscriptionOperation (document: DocumentNode, operationName: string): boolean
