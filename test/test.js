var express = require('express');
var WebDriver = require('../lib/webdriver.js');
var assert = require('assert');

var port = 8080;

var app = express();
var server = app.listen(port);

app.use('/', express.static(__dirname + '/'));

exports["test1"] = function(test){
    var options = {};
    if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
        options = {
            port: 4445,
            hostname: "localhost",
            username: process.env.SAUCE_USERNAME,
            password: process.env.SAUCE_ACCESS_KEY,
            desiredCapabilites: {
                browser: "firefox",
                "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
            }
        };
    }

    new WebDriver.Session(options, function() {
        test.expect(18);
        var url = "http://localhost:" + port + "/testpage1.html";
        this.url = url;
        test.equal(this.url, url, "Get page URL");
        test.equal(this.title, "Test page1", "Get page title");

        var textarea1 = this.element("#textarea1");
        var input = this.element("#input1");
        test.equal(input.value, 'default value', 'Get element value');
        test.equal(input.clear().value, '', 'Clear element value');
        test.equal(this.element("#disabled").enabled, false, 'Get element disable state');

        var div1 = this.elements("#div1")[0];
        test.equal(div1.width, 300, "Get element width");
        test.equal(div1.height, 200, "Get element height");
        test.equal(div1.attr('data-attr'), "attributeVal", "Get element attribute");
        test.equal(div1.css('font-size'), "11px", "Get CSS font-size");
        test.equal(div1.equals(this.element('[data-attr="attributeVal"]')), true, "Test element equality with equal()");

        var checkbox = this.element("#checkbox");
        test.equal(checkbox.selected, false, "Get element checkbox state");

        var hiddenElement = this.element("#hidden");

        test.equal(hiddenElement.displayed, false, "Get element visibility");

        this.execute(function(element) {
            element.style.display = "block";
        }, hiddenElement);
        test.equal(hiddenElement.displayed, true, "Execute sync JS script");

        var body = this.execute(function() {
            return document.body;
        });

        test.equal(this.element("body").equals(body), true, "Return element from JS script");

        var input2 = this.executeAsync(function(done) {
            window.setTimeout(function() {
                done(document.getElementById("input2"));
            }, 200);
        }, 1000);
        test.equal(input2.value, "input2 val", "Get element from async js exec");

        var asyncCalculation = this.executeAsync(function(a, b, done) {
            window.setTimeout(function() {
                done(a*b);
            }, 100);
        }, 2000, [5, 10]);
        test.equal(asyncCalculation, 50, "Asynchronous js execution with arguments");

        var offset = textarea1.offset();
        test.equal(textarea1.name, "textarea", "Get element node name");
        test.equal(offset.x === 0 && offset.y > 0, true, "Get element location");

        this.close();
        test.done();
        server.close();
    });
}
