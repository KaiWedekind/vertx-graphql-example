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
  return { query: body };
}

const jsonEncodedParser = (body) => {
  return new Promise((resolve, reject) => {
    if (jsonObjRegex.test(body)) {
      /* eslint-disable no-empty */
      try {
        return resolve({
          data: JSON.parse(body)
        });
      } catch (error) {
        console.log('error', error)
        // Do nothing
      }
      /* eslint-enable no-empty */
    }
    console.log('error', 'critical')
    return resolve({
      error: 'POST body sent invalid JSON.'
    });
  });
} 

const parseBody = (ctx) => {
  return new Promise((resolve, reject) => {
    const body = ctx.getBody();
    const bodyString = ctx.getBodyAsString();
    const contentType = ctx.request().getHeader('content-type');

    // Skip requests without content types.
    if (contentType === undefined) {
      return resolve({});
    }

    // If vertx has already parsed a body as a string, and the content-type
    // was application/graphql, parse the string body.
    if (typeof body === 'string' && contentType === 'application/graphql') {
      return resolve(graphqlParser(body));
    }

    switch (contentType) {
      case 'application/graphql':
        // return read(req, typeInfo, graphqlParser, resolve, reject);
      case 'application/json':
        return resolve(jsonEncodedParser(body.toString()));
        // return read(req, typeInfo, jsonEncodedParser, resolve, reject);
      case 'application/x-www-form-urlencoded':
        console.log('body urlencoded', body.toString())
        // return read(req, typeInfo, urlEncodedParser, resolve, reject);
    }

    

    /*
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      body = {};
    }
    */

    // console.log('contentType', contentType);

  
    // return resolve(JSON.parse(bodyString));
  });
}

module.exports = { 
  parseBody
};