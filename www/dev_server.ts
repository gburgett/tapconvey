import { Application, Router, Request, Response, NextFunction } from 'express'
import * as webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
import { Transform } from 'stream'

import { Server } from './_testserver'
import { NodeTapParser } from '../src/parser'
import { Summary, Test } from '../src/parser/results'

var WebpackDevServer = require("webpack-dev-server");

//modify config
const config = require('./webpack.config.js')
config.entry = [
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://0.0.0.0:8080',
  'webpack/hot/only-dev-server'
].concat(config.entry)
console.log('entry: ', config.entry)

config.plugins.push(new webpack.HotModuleReplacementPlugin())

//start compiler and server
const testApi = new Server()
var compiler = webpack(config)
var server = new WebpackDevServer(compiler, {
  hot: true,
  setup: function(app: Application) {
    //setup test API
    testApi.init(app)
  }
})

server.listen(8080, "localhost", function() { })

process.argv.forEach(function(val) {
  // find and process the file
  if (path.extname(val) === '.tap') {
    fs.createReadStream(val)
      .pipe(new NodeTapParser())
      .pipe(testApi.writeableSource('file: ' + val))
  }
})

process.stdin.pipe(new NodeTapParser())
  .pipe(testApi.writeableSource('stdin'))
