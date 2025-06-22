async function run() {
  await require('./resumeController.test')();
  await require('./utils.test')();
  await require('./remoteSync.test')();
  await require('./sync.test')();
  await require('./authService.test')();
  await require('./resumeService.test')();
  await require('./adminService.test')();
  require('./resumeFlow.test.js');
  require('./loginFlow.test.js');
  require('./pdfService.test.js');
  require('./syncEngineFlow.test.js');
  require('./adminAccess.test.js');
  await require('./templateAi.test.js')();
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
