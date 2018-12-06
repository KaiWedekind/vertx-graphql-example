const renderOverview = ({
  ENDPOINT,
  GRAPHIQL,
  PLAYGROUND
}) => {
  return `
  <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>GraphQL-Vert.x</title>
      <meta name="robots" content="noindex" />
      <meta name="referrer" content="origin" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shortcut icon" href="https://graphql.org/img/favicon.png">
      <style>
        * {
          box-sizing: border-box;
        }

        html, body {
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          font-family:
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Oxygen-Sans",
            "Ubuntu",
            "Cantarell",
            "Helvetica Neue",
            "sans-serif";
          color: #fff;
          background: rgb(9, 20, 28);
          border: 2rem solid #172B3A;
        }

        .title {
          // color: rgb(41, 185, 115);
          color: #DF0197;
        }

        .code__tag {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 300px;
          background-color: #172B3A;
          padding: 1rem 2rem;
        }

        .btn-group {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
        }

        .btn {
          margin: 1rem;
          padding: 1rem 2rem;
          color: #02E475;
          text-decoration: none;
          border: 2px solid #02E475;
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          transition: background-color 0.2s ease-out;
        }

        .btn:hover {
          color: rgb(9, 20, 28);
          background-color: #02E475;
        }

        .link {
          color: rgb(42, 126, 210);
          font-style: italic;
        }

        .text-small {
          font-size: 0.9rem;
        }
      </style>
    </head>
    
    <body>
      <h1 class="title">GraphQL-VERT.X</h1>

      <pre class="code__tag">
        <code>POST: ${ENDPOINT}</code>
      </pre>

      <div class="btn-group">
        <a class="btn" href="${GRAPHIQL}">GraphiQL</a>
        <a class="btn" href="${PLAYGROUND}">Playground</a>
      </div>

      <p class="text-small">
        Documentation: <a class="link" href="https://graphql.org">https://graphql.org</a>
      </p>
    </body>
    </html>
  `;
};

module.exports = { 
  renderOverview
};
