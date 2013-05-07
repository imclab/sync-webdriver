Synchronous Web Driver API
==========================

sync-webdriver is a node.js module that provides a synchronous API to the [web driver bindings](https://code.google.com/p/selenium/wiki/JsonWireProtocol).
It uses [node fibers](https://github.com/laverdet/node-fibers) to execute the asynchronous commands synchronously.

Current Build Status
--------------------

[![Build Status](https://travis-ci.org/niklasvh/sync-webdriver.png?branch=master)](https://travis-ci.org/niklasvh/sync-webdriver)

Installation
------------

    npm install sync-webdriver

Example
-------

    new WebDriver.Session(function() {
        // web driver commands run synchronously here

        this.go("http://google.com");
        if (this.title.indexOf("Google") !== -1) {
            console.log("Success!");
        }

        this.element("input[type='submit']").click();

        var asyncCalculation = this.executeAsync(function(a, b, done) {
            window.setTimeout(function() {
                done(a*b);
            }, 100);
        }, 2000, [5, 10]);

        if (asyncCalculation === 50) {
            console.log("Success! Running asynchronous code synchronously!");
        }
    });


Documentation
-------------

   * [API Docs](http://niklasvh.github.io/sync-webdriver/docs/)
   * [Web Driver commands](https://code.google.com/p/selenium/wiki/JsonWireProtocol)


Changelog
----------

2013.05.07 - 0.1.0

   * First version


Released under the MIT License
------------------------------

Copyright (c) 2013 Niklas von Hertzen

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.