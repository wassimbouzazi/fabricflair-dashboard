const http = require("http");
const config = require("./config");
const port = config.httpPORT;

const app = require("./app");
const server = http.createServer(app);
server.listen(port, () => {
  console.log(
    `Server started in ${config.envName} mode at port ${config.httpPORT}.`
  );
});
