var By = require("./By").By;
var WebElement = require("./WebElement").WebElement;
var Future = require('fibers/future'), wait = Future.wait;
var http = require("http");

function Request(options, data) {
    var future = new Future();

    var content = "";
    if (data) {
        options.headers['content-length'] = (data) ? JSON.stringify(data).length : 0;
    }

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            content += chunk;
        });
        response.on('end', function() {
            future.return({
                data: content,
                status: response.statusCode,
                headers: response.headers
            });
        });
    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    if (data) {
        request.write(JSON.stringify(data));
    }

    request.end();
    return future;
}

/**
 Create a new Web Driver session

 @class Session
 @async
 @param {Object} [options]
    Options for WebDriver session
    @param {String} [options.hostname=localhost]
    @param {Number} [options.port=4444] Selenium server port
    @param {String} [options.path="/wd/hub"] Path to Selenium server REST hub
    @param {String} [options.username] Username for Basic authentication
    @param {String} [options.password] Password for Basic authentication
 @param {Function} callback Function context where to run WebDriver commands
 @example
        new WebDriver.Session(function() {
           this.go("http://google.com");
           if (this.title.indexOf("Google") !== -1) {
                console.log("Success!");
           }
        });
 @example
        new WebDriver.Session({
           hostname: "ondemand.saucelabs.com",
           port: 80,
           username: "<username>",
           password: "<password>"
        }, function() {
           this.url = "http://facebook.com";
        });
 @constructor
 **/
var Session = function(options, callback) {
    if (typeof(options) === "function") {
        callback = options;
        options = {};
    }
    options = options || {};
    this.hostname = options.hostname || "localhost";
    this.port = options.port || 4444;
    this.path = options.path || "/wd/hub";
    this.sessionId = null;
    this.username = options.username;
    this.password = options.password;
    this.desiredCapabilities = options.desiredCapabilities || {
        browserName: "firefox"
    };
    this.setup();
    callback.call(this);
    this.close();
}.future();

Session.prototype.setup = function() {
    var response = this.POST("/session", {
        desiredCapabilities: this.desiredCapabilities
    }, (this.username && this.password) ? this.username + ":" + this.password : null);
    if (response.status === 302 || response.status === 303) {
        this.sessionId = response.headers.location.substring(response.headers.location.lastIndexOf("/")+1);
    }
};

Session.prototype.close = function() {
    if (this.sessionId) {
        this.DELETE('/session/:sessionId');
    }
    this.sessionId = null;

    return this;
};

Session.prototype.log = function(message, color) {
    console.log(message);
};

Session.prototype.requestOptions = function(path, auth) {
    var options = {
        hostname: this.hostname,
        port: this.port,
        path: this.path + path.replace(':sessionId', this.sessionId),
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Accept': 'application/json',
            'charset': 'charset=UTF-8'
        }
    };
    if (auth) {
        options.headers.Authorization = 'Basic ' + (new Buffer(auth)).toString('base64');
    }
    return options;
};

Session.prototype.GET = function(path, auth) {
    this.log("GET " + path);
    return Request(this.requestOptions(path, auth)).wait();
};

Session.prototype.POST = function(path, data, auth) {
    var options = this.requestOptions(path, auth);
    options.method = 'POST';
    this.log("POST " + path);
    return Request(options, data).wait();
};

Session.prototype.DELETE = function(path, auth) {
    var options = this.requestOptions(path, auth);
    options.method = 'DELETE';
    delete options.headers;
    this.log("DELETE " + path);
    return Request(options).wait();
};

Session.prototype.parseResponse = function(data) {
    var response = JSON.parse(data.data);
    if (response.status !== 0) {
        console.log("Error code", response.status);
    }

    return response.value;
};

Session.prototype.parseElement = function(response) {
    if (response && typeof(response) === "object" && typeof(response.ELEMENT) === "string") {
        return new WebElement(this, response);
    }
    return response;
};

/**
 Navigate forwards in the browser history, if possible.
 @method forward
 @chainable
 */
Session.prototype.forward = function() {
    this.POST("/session/:sessionId/forward");
    return this;
};

/**
 Navigate backwards in the browser history, if possible.
 @method back
 @chainable
 */
Session.prototype.back = function() {
    this.POST("/session/:sessionId/back");
    return this;
};

/**
 Refresh the current page.
 @method refresh
 @chainable
 */
Session.prototype.refresh = function() {
    this.POST("/session/:sessionId/refresh");
    return this;
};

/**
 Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
 The executed script is assumed to be synchronous and the result of evaluating the script is returned to the client.

 Arguments may be any JSON-primitive, array, or JSON object. JSON objects that define a WebElement reference will be converted to the corresponding DOM element.
 Likewise, any WebElements in the script result will be returned to the client as WebElement JSON objects.
 @method execute
 @param {Function} func The function to execute
 @param {Array} [args] The function arguments
 @example
        var hiddenElement = this.element("#hidden");
        this.execute(function(element) {
            element.style.display = "block";
        }, hiddenElement);
 @example
        var body = this.execute(function() {
            return document.body;
        });
        this.element("body").equals(body) // true;
 @return The script result.
 */
Session.prototype.execute = function(func, args) {
    args = (Array.isArray(args) ? args : (args ? [args] : [])).map(function(arg){
        return (arg instanceof WebElement) ? arg.element : arg;
    });
    return this.parseElement(this.parseResponse(this.POST("/session/:sessionId/execute", {
        script: "return (" + func.toString() + ").apply(null, arguments);",
        args: args
    })));
};

/**
 Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
 The executed script is assumed to be asynchronous and must signal that is done by invoking the provided callback, which is always provided as the final argument to the function.
 The value to this callback will be returned to the client.

 Asynchronous script commands may not span page loads. If an unload event is fired while waiting for a script result, an error should be returned to the client.

 The script argument defines the script to execute in the form of a function. The function will be invoked with the provided args array and the values may be accessed via the arguments object in the order specified.
 The final argument will always be a callback function that must be invoked to signal that the script has finished.

 Arguments may be any JSON-primitive, array, or JSON object. WebElement references will be converted to the corresponding DOM element.
 Likewise, any WebElements in the script result will be returned to the client as WebElement objects.
 @method executeAsync
 @param {Function} func The function to execute
 @param {Number} timeout=1000 Set the amount of time, in milliseconds, that asynchronous script permitted to run before they are aborted and a Timeout error is returned to the client.
 @param {Array} [args] The function arguments
 @example
         var input2 = this.executeAsync(function(done) {
           window.setTimeout(function() {
               done(document.getElementById("input2"));
           }, 200);
        }, 1000);
 @example
        var asyncCalculation = this.executeAsync(function(a, b, done) {
           window.setTimeout(function() {
               done(a*b);
           }, 100);
        }, 2000, [5, 10]);
        if (asyncCalculation === 50) {
            console.log("Success! Running asynchronous code synchronously!");
        }
 @return The script result.
 */
Session.prototype.executeAsync = function(func, timeout, args) {
    this.POST("/session/:sessionId/timeouts/async_script", {
        ms: timeout
    });

    args = (Array.isArray(args) ? args : (args ? [args] : [])).map(function(arg){
        return (arg instanceof WebElement) ? arg.element : arg;
    });
    return this.parseElement(this.parseResponse(this.POST("/session/:sessionId/execute_async", {
        script: "return (" + func.toString() + ").apply(null, arguments);",
        args: args
    })));
};

/**
 Take a screenshot of the current page.
 @method screenshot
 @return {String} The screenshot as a base64 encoded PNG.
 */
Session.prototype.screenshot = function() {
    return this.parseResponse(this.GET("/session/:sessionId/screenshot"));
};

/**
 Search for an element on the page, starting from the document root.
 The located element will be returned as a WebElement object.
 Each locator must return the first matching element located in the DOM.
 @method element
 @param {String} value The search target
 @param {By} [using=By.cssSelector] The locator strategy to use.
 @return {WebElement} A WebElement object for the located element.
 */
Session.prototype.element = function(value, using) {
    using = using || By.cssSelector;
    var response = this.POST("/session/:sessionId/element", {
        using: using,
        value: value
    });

    return new WebElement(this, this.parseResponse(response));
};

/**
 Search for multiple elements on the page, starting from the document root.
 The located elements will be returned as an array of WebElement objects.
 Elements should be returned in the order located in the DOM.
 @method elements
 @param {String} value The search target
 @param {By} [using=By.cssSelector] The locator strategy to use.
 @return {WebElement[]} A list of WebElements for the located elements.
 */
Session.prototype.elements = function(value, using) {
    using = using || By.cssSelector;
    var response = this.POST("/session/:sessionId/elements", {
        using: using,
        value: value
    });

    var self = this;

    return this.parseResponse(response).map(function(element) {
        return new WebElement(self, element);
    });
};

/**
 Send a sequence of key strokes to the active element. This command is similar to the send keys command in every aspect except the implicit termination:
 The modifiers are not released at the end of the call. Rather, the state of the modifier keys is kept between calls, so mouse interactions can be
 performed while modifier keys are depressed.
 @method keys
 @param {String|String[]} value The keys sequence to be sent.
 @chainable
 */
Session.prototype.keys = function(value) {
    this.POST("/session/:sessionId/keys", {
        value: Array.isArray(value) ? value : value.split('')
    });
    return this;
};

/**
 Navigate to a new URL.
 @method go
 @param {String} value The URL to navigate to.
 @example
 this.go("http://google.com");
 @chainable
 */
Session.prototype.go = function(url) {
    this.POST("/session/:sessionId/url", {url: url});
    return this;
};

/**
 Accepts the currently displayed alert dialog. Usually, this is equivalent to clicking on the 'OK' button in the dialog.
 @method acceptAlert
 @chainable
 */
Session.prototype.acceptAlert = function() {
    this.POST("/session/:sessionId/accept_alert");
    return this;
};

/**
 Dismisses the currently displayed alert dialog. For confirm() and prompt() dialogs, this is equivalent to clicking the 'Cancel' button.
 For alert() dialogs, this is equivalent to clicking the 'OK' button.
 @method dismissAlert
 @chainable
 */
Session.prototype.dismissAlert = function() {
    this.POST("/session/:sessionId/dismiss_alert");
    return this;
};

/**
 Move the mouse by an offset of the specificed element. If no element is specified, the move is relative to the current mouse cursor.
 If an element is provided but no offset, the mouse will be moved to the center of the element. If the element is not visible, it will be scrolled into view.
 For alert() dialogs, this is equivalent to clicking the 'OK' button.
 @method moveMouse
 @param {number} xoffset X offset to move to, relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
 @param {number} yoffset Y offset to move to, relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
 @param {WebElement} [element=null] WebElement to use for offset. If not specified or is null, the offset is relative to current position of the mouse.
 @chainable
 */
Session.prototype.moveMouse = function(x, y, element) {
    if (element) {
        element = element.element.ELEMENT;
    }
    this.POST("/session/:sessionId/moveto", {
        element: element,
        xoffset: x || 0,
        yoffset: y || 0
    });
    return this;
};

/**
 Click any mouse button (at the coordinates set by the last moveto command).
 Note that calling this command after calling buttondown and before calling button up (or any out-of-order interactions sequence) will yield undefined behaviour).
 @method click
 @param {MouseButtons} [button=MouseButtons.LEFT]  Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button if not specified.
 @chainable
 */
Session.prototype.click = function(button) {
    this.POST("/session/:sessionId/click", {button: button});
    return this;
};

/**
 Click and hold the left mouse button (at the coordinates set by the last moveto command).
 Note that the next mouse-related command that should follow is buttonup . Any other mouse command (such as click or another call to buttondown) will yield undefined behaviour.
 @method buttonDown
 @param {MouseButtons} [button=MouseButtons.LEFT]  Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button if not specified.
 @chainable
 */
Session.prototype.buttonDown = function(button) {
    this.POST("/session/:sessionId/buttondown", {button: button});
    return this;
};

/**
 Releases the mouse button previously held (where the mouse is currently at).
 Must be called once for every buttondown command issued. See the note in click and buttondown about implications of out-of-order commands.
 @method buttonUp
 @param {MouseButtons} [button=MouseButtons.LEFT]  Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button if not specified.
 @chainable
 */
Session.prototype.buttonUp = function(button) {
    this.POST("/session/:sessionId/buttonup", {button: button});
    return this;
};

/**
 Double-clicks at the current mouse coordinates (set by moveto).
 @method doubleClick
 @chainable
 */
Session.prototype.doubleClick = function() {
    this.POST("/session/:sessionId/doubleclick");
    return this;
};

Object.defineProperties(Session.prototype, {
    /**
     Get or set the text of the currently displayed JavaScript `alert()`, `confirm()`, or `prompt()` dialog.
     @attribute alertText
     @type String
     **/
    alertText: {
        set: function(value) {
            this.POST("/session/:sessionId/alert_text", {text: value});
            return this;
        },
        get: function() {
            return this.parseResponse(this.GET("/session/:sessionId/alert_text"));
        }
    },
    /**
     Get the current page title.
     @attribute title
     @readOnly
     @type String
     **/
    title: {
        get: function() {
            return this.parseResponse(this.GET("/session/:sessionId/title"));
        }
    },
    /**
     Get or set the url for the current window.
     @attribute url
     @type String
     **/
    url: {
        set: function(url) {
            return this.go(url);
        },
        get: function() {
            return this.parseResponse(this.GET("/session/:sessionId/url"));
        }
    },
    /**
     Get or set the current browser orientation. The orientation should be specified as defined as `LANDSCAPE` or `PORTRAIT`.
     @attribute orientation
     @type String
     **/
    orientation: {
        set: function(orientation) {
            this.POST("/session/:sessionId/orientation", {orientation: orientation});
            return this;
        },
        get: function() {
            return this.parseResponse(this.GET("/session/:sessionId/orientation"));
        }
    }
});

exports.Session = Session;