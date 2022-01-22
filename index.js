require('dotenv').config();

const { createApp } = require('./app');

(async () => {
  const app = await createApp();
  app.listen(process.env.PORT, (err, address) => {
    if (err) {
      console.log(err);
      fastify.log.error(err);
      process.exit(1);
    }
    app.blipp();
    app.log.info(`server listening on ${address}`);
  });
})();
