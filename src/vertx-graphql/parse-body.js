const querystring = require('querystring');

/**
 * RegExp to match an Object-opening brace "{" as the first non-space
 * in a string. Allowed whitespace is defined in RFC 7159:
 *
 *     x20  Space
 *     x09  Horizontal tab
 *     x0A  Line feed or New line
 *     x0D  Carriage return
 */
const jsonObjRegex = /^[\x20\x09\x0a\x0d]*\{/;

const graphqlParser = (body) => {
  return new Promise((resolve) => {
    return resolve({
      data: { query: body }
    });
  });
}

function urlEncodedParser(body) {
  return new Promise((resolve) => {
    return resolve({
      data: querystring.parse(body)
    });
  });
}

const jsonEncodedParser = (body) => {
  return new Promise((resolve) => {
    if (jsonObjRegex.test(body)) {
      /* eslint-disable no-empty */
      try {
        return resolve({
          data: JSON.parse(body)
        });
      } catch (error) {
        // Do nothing
      }
      /* eslint-enable no-empty */
    }
    return resolve({
      error: 'POST body sent invalid JSON.'
    });
  });
}

const parseBody = (ctx) => {
  return new Promise((resolve) => {
    const body = ctx.getBody();
    const contentType = ctx.request().getHeader('content-type');

    // Skip requests without content types.
    if (contentType === undefined || contentType === null) {
      return resolve({
        error: 'No Content Type'
      });
    }

    // If vertx has already parsed a body as a string, and the content-type
    // was application/graphql, parse the string body.
    if (typeof body === 'string' && contentType === 'application/graphql') {
      return resolve(graphqlParser(body));
    }

    switch (contentType) {
      case 'application/graphql':
        return resolve(graphqlParser(body.toString()));
      case 'application/json':
        return resolve(jsonEncodedParser(body.toString()));
      case 'application/x-www-form-urlencoded':
        return resolve(urlEncodedParser(body.toString()));
    }
  });
}

module.exports = { 
  parseBody
};