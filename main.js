import { buildFastify } from './app/index.js';

const app = buildFastify({
  logger: true,
});

try {
  await app.ready();
  await app.listen(app.config.PORT);
} catch (error) {
  console.log(error);
  process.exit(1);
}
