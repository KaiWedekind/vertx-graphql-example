class VertxGraphQLSubscriptionServer {
    constructor({ schema }, { server, path}) {
      console.log('server', server)
      /*
      if (server &&
        server.websocketHandler &&
        typeof server.websocketHandler === 'function'
        && path) {
          console.log('server', server)
          /*
          server.websocketHandler((websocket) => {
            if (websocket.path() === path) {
              console.log('Sec-WebSocket-Extensions', websocket.headers().get('Sec-WebSocket-Extensions'));
              console.log('Sec-WebSocket-Key', websocket.headers().get('Sec-WebSocket-Key'));
              console.log('Sec-Websocket-Protocol', websocket.headers().get('Sec-Websocket-Protocol'));
              console.log('Sec-WebSocket-Version', websocket.headers().get('Sec-WebSocket-Version'));
              console.log('Upgrade', websocket.headers().get('Upgrade'));
              console.log('Connection', websocket.headers().get('Connection'));
              console.log('upgrade', websocket.headers().get('upgrade'));
  
              console.log('websocket', websocket);
              websocket.accept();
              
            } else {
              console.log('reject');
              websocket.reject();
            }
          });
          */
      //}
  
      return server;
    }
  }




/*
const subscriptionServer = new VertxGraphQLSubscriptionServer({
  schema
}, {
  server: server,
  path: '/subscriptions',
});

subscriptionServer.listen(PORT, () => {
  console.log('Server started')
});
*/

  