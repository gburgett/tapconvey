import { Application, Router, Request, Response, NextFunction } from 'express'
import * as webpack from 'webpack'

import { Server } from './_testserver'

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
var testApi: Server
var compiler = webpack(config)
var server = new WebpackDevServer(compiler, {
  hot: true,
  setup: function(app: Application) {
    //setup test API
    testApi = new Server(app)
  }
})

if (!testApi) {
  throw new Error('no test api')
}

server.listen(8080, "localhost", function() { })
