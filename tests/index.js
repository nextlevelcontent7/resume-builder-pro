async function run() {
  await require('./resumeController.test')();
  await require('./utils.test')();
  await require('./remoteSync.test')();
  await require('./authService.test')();
  await require('./resumeService.test')();
  await require('./adminService.test')();
  console.log('all test suites completed');
}
(async () => {
  try {
    await run();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
})();
