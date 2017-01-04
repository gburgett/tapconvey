## Tapconvey

[![Build Status](https://travis-ci.org/gburgett/tapconvey.svg?branch=master)](https://travis-ci.org/gburgett/tapconvey)
[![Coverage Status](https://coveralls.io/repos/github/gburgett/tapconvey/badge.svg?branch=master)](https://coveralls.io/github/gburgett/tapconvey?branch=master)

TapConvey is like [GoConvey](https://github.com/smartystreets/goconvey) for anything that 
produces [TAP](https://testanything.org/) output.  It reads TAP-formatted test results from 
the command line and launches a web interface to display the results.

There are TAP producing test runners for Ada, C, C++, C#, Common Lisp, Elixir, Erlang, Fish,
Forth, Fortran, Go, Haskell, Java, JavaScript, Limbo, Lua, MATLAB, OCaml, Pascal, Perl, PHP, 
Prolog, Python, Ruby, Sass, Shell, SQL, and TypeScript (and probably others).  Tapconvey reads
the TAP format from STDIN.

usage:

```
npm install --save-dev tapconvey
[my test runner] | ./node_modules/.bin/tapconvey | [another TAP reporter]
```

tapconvey will launch a web browser pointing to http://localhost:8080 so you can see the results.
If the browser is not automatically launched, please navigate to http://localhost:8080 by yourself.

examples:
```
tap test/**/*.js | tapconvey | tap-spec
```

```
mocha -R spec --recursive 'test/**/*.js' | tapconvey | tap-spec
```