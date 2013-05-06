/**
 @class By
 */
var By = {
    /**
     Returns an element whose class name contains the search value; compound class names are not permitted.
     @property className
     @static
     @type {Strategy}
     **/
    className: "class name",
    /**
     Returns an element matching a CSS selector.
     @property cssSelector
     @static
     @type {Strategy}
     **/
    cssSelector: "css selector",
    /**
     Returns an element whose `ID` attribute matches the search value.
     @property id
     @static
     @type {Strategy}
     **/
    id: "id",
    /**
     Returns an element whose `NAME` attribute matches the search value.
     @property name
     @static
     @type {Strategy}
     **/
    name: "name",
    /**
     Returns an anchor element whose visible text matches the search value.
     @property linkText
     @static
     @type {Strategy}
     **/
    linkText: "link text",
    /**
     Returns an anchor element whose visible text partially matches the search value.
     @property partialLinkText
     @static
     @type {Strategy}
     **/
    partialLinkText: "partial link text",
    /**
     Returns an element whose tag name matches the search value.
     @property tagName
     @static
     @type {Strategy}
     **/
    tagName: "tagName",
    /**
     Returns an element matching an XPath expression.
     @property xpath
     @static
     @type {Strategy}
     **/
    xpath: "xpath"
};

Object.freeze(By);

exports.By = By;