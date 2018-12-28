FROM oracle/graalvm-ce:1.0.0-rc8
WORKDIR /
ADD target/dist/vertx-graphql-example-1.0.0.jar App.jar
EXPOSE 9100
CMD java -jar App.jar