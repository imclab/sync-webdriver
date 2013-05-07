var Errors = {
    NoSuchDriver: function() {
        this.name = "NoSuchDriver";
        this.message = "A session is either terminated or not started";
        this.code = 6;
    },
    NoSuchElement: function() {
        this.name = "NoSuchElement";
        this.message = "An element could not be located on the page using the given search parameters.";
        this.code = 7;
    },
    NoSuchFrame: function() {
        this.name = "NoSuchFrame";
        this.message = "A request to switch to a frame could not be satisfied because the frame could not be found.";
        this.code = 8;
    },
    UnknownCommand: function() {
        this.name = "UnknownCommand";
        this.message = "The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.";
        this.code = 9;
    },
    StaleElementReference: function() {
        this.name = "StaleElementReference";
        this.message = "An element command failed because the referenced element is no longer attached to the DOM.";
        this.code = 10;
    },
    ElementNotVisible: function() {
        this.name = "ElementNotVisible";
        this.message = "An element command could not be completed because the element is not visible on the page.";
        this.code = 11;
    },
    InvalidElementState: function() {
        this.name = "InvalidElementState";
        this.message = "An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).";
        this.code = 12;
    },
    UnknownError: function() {
        this.name = "UnknownError";
        this.message = "An unknown server-side error occurred while processing the command.";
        this.code = 13;
    },
    ElementIsNotSelectable: function() {
        this.name = "ElementIsNotSelectable";
        this.message = "An attempt was made to select an element that cannot be selected.";
        this.code = 15;
    },
    JavaScriptError: function() {
        this.name = "JavaScriptError";
        this.message = "An error occurred while executing user supplied JavaScript..";
        this.code = 17;
    },
    XPathLookupError: function() {
        this.name = "XPathLookupError";
        this.message = "An error occurred while searching for an element by XPath.";
        this.code = 19;
    },
    Timeout: function() {
        this.name = "Timeout";
        this.message = "An operation did not complete before its timeout expired.";
        this.code = 21;
    },
    NoSuchWindow: function() {
        this.name = "NoSuchWindow";
        this.message = "A request to switch to a different window could not be satisfied because the window could not be found.";
        this.code = 23;
    },
    InvalidCookieDomain: function() {
        this.name = "InvalidCookieDomain";
        this.message = "An illegal attempt was made to set a cookie under a different domain than the current page.";
        this.code = 24;
    },
    UnableToSetCookie: function() {
        this.name = "UnableToSetCookie";
        this.message = "A request to set a cookie's value could not be satisfied.";
        this.code = 25;
    },
    UnexpectedAlertOpen: function() {
        this.name = "UnexpectedAlertOpen";
        this.message = "A modal dialog was open, blocking this operation.";
        this.code = 26;
    },
    NoAlertOpenError: function() {
        this.name = "NoAlertOpenError";
        this.message = "An attempt was made to operate on a modal dialog when one was not open.";
        this.code = 27;
    },
    ScriptTimeout: function() {
        this.name = "ScriptTimeout";
        this.message = "A script did not complete before its timeout expired.";
        this.code = 28;
    },
    InvalidElementCoordinates: function() {
        this.name = "InvalidElementCoordinates";
        this.message = "The coordinates provided to an interactions operation are invalid.";
        this.code = 29;
    },
    IMENotAvailable: function() {
        this.name = "IMENotAvailable";
        this.message = "IME was not available.";
        this.code = 30;
    },
    IMEEngineActivationFailed: function() {
        this.name = "IMEEngineActivationFailed";
        this.message = "An IME engine could not be started.";
        this.code = 31;
    },
    InvalidSelector: function() {
        this.name = "InvalidSelector";
        this.message = "Argument was an invalid selector (e.g. XPath/CSS).";
        this.code = 32;
    },
    SessionNotCreatedException: function() {
        this.name = "SessionNotCreatedException";
        this.message = "A new session could not be created.";
        this.code = 33;
    },
    MoveTargetOutOfBounds: function() {
        this.name = "MoveTargetOutOfBounds";
        this.message = "Target provided for a move action is out of bounds.";
        this.code = 34;
    }
};

Object.keys(Errors).forEach(function(errorId) {
    Errors[errorId].prototype = new Error();
    Errors[errorId].prototype.constructor = Errors[errorId];
});

Object.freeze(Errors);

exports.Errors = Errors;