#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const package = require('./package.json');

program
  .version(package.version)
  .usage('[options] <file>')
  .option('-o, --output [dir]', 'Directory where the captured screenshots will be saved', 'pastshots')
  .option('-h, --host [url]', 'Host that serves the pages described in <file>', 'http://localhost/')
  .parse(process.argv);

const file = program.args[0];

if (file) {
  const capture = require('./capture').capture;
  const pages = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));

  capture({
    output: program.output,
    host: program.host,
    dimensions: [[1024, 768]],
    pages: pages
  });
} else {
  console.error('No pages provided.');
}
