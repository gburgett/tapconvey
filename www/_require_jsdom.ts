/*
 * _require_jsdom.js:
 *   sets up the jsdom context before we require React for the first time.
 *   This is necessary to do anything more than a shallow rendering in our
 *   NodeJS environment.
 *   https://github.com/facebook/react/issues/5046#issuecomment-146222515
 */

var jsdom = require("jsdom");

global['document'] = jsdom.jsdom('<!doctype html><html><body></body></html>');
global['window'] = document.defaultView;
global['navigator'] = global['window'].navigator