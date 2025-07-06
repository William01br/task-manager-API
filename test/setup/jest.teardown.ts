export default async function teardown() {
  await global.testContainerMongo.stop();
  await global.testContainerRedis.stop();

  // close all possibly open connections
  process.exit(1);
}
