if (!('AGILE_MODULE_NAME' in global.process.env)) {
    console.log('请使用agile自动化发布，禁止本地publish')
    process.exit(1);
}