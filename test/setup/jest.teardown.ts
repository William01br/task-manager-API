export default async function teardown() {
  await global.testContainerMongo.stop();
  await global.testContainerRedis.stop();

  process.exit(1);
}
