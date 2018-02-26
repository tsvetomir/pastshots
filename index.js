#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const package = require('./package.json');

// "pastshots --output tests/output --host tests/visual/*.html --port 8081",

program
  .version(package.version)
  .usage('[options] ')
  .option('--output <dir>', 'Directory where the captured screenshots will be saved', 'pastshots')
  .option('--serve <glob>', 'Pages to serve with an embedded HTTP server', false)
  .option('--port <number>', 'Port under which to ', 8081)
  .parse(process.argv);

const { serve, port, output } = program;
const glob = require('glob');
const pages = glob.sync(serve);

const createServer = require('http-server').createServer;
const server = createServer({
  root: './',
  showDotfiles: false,
  port
});

server.listen(port);

const capture = require('./capture').capture;

capture({
  host: `http://localhost:${port}/`,
  output,
  pages
})
  .then(() => server.close());
