/**
 An object representing an element inside the DOM

 @class WebElement
 **/
function WebElement(host, element) {
    this.host = host;
    this.element = element;
}

Object.defineProperties(WebElement.prototype, {
    /**
     Determine if an element is currently displayed.
     @attribute displayed
     @readOnly
     @type Boolean
     **/
    "displayed": {
        get: function() {
            return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/displayed"));
        }
    },
    /**
     Determine if an element is currently enabled.
     @attribute enabled
     @readOnly
     @type Boolean
     **/
    "enabled": {
        get: function() {
            return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/enabled"));
        }
    },
    /**
     Determine an element's height in pixels.
     @attribute height
     @readOnly
     @type Number
     **/
    height: {
        get: function() {
            return this.size().height;
        }
    },
    /**
     Determine an element's tag name.
     @attribute name
     @readOnly
     @type String
     **/
    "name": {
        get: function() {
            return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/name"));
        }
    },
    /**
     Determine if an `OPTION` element, or an `INPUT` element of type checkbox or radiobutton is currently selected.
     @attribute selected
     @readOnly
     @type Boolean
     **/
    "selected": {
        get: function() {
            return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/selected"));
        }
    },
    /**
     Returns the visible text for the element.
     @attribute text
     @readOnly
     @type String
     **/
    "text": {
        get: function() {
            return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/text"));
        }
    },
    /**
     Get or set the value of the element.
     @attribute text
     @type String
     **/
    value: {
        set: function(value) {
            this.val(value);
        },
        get: function() {
            return this.attr("value");
        }
    },
    /**
     Determine an element's width in pixels.
     @attribute width
     @readOnly
     @type Number
     **/
    width: {
        get: function() {
            return this.size().width;
        }
    }
});

WebElement.prototype.POST = function() {
    var args = [].slice.call(arguments, 0);
    args[0] = args[0].replace(":id", this.element.ELEMENT);
    return this.host.POST.apply(this.host, args);
};

WebElement.prototype.GET = function() {
    var args = [].slice.call(arguments, 0);
    args[0] = args[0].replace(":id", this.element.ELEMENT);
    return this.host.GET.apply(this.host, args);
};

/**
 Clear a `TEXTAREA` or text `INPUT` element's value.
 @method clear
 @chainable
 */
WebElement.prototype.clear = function() {
    this.POST("/session/:sessionId/element/:id/clear");
    return this;
};

/**
 Click on an element.
 @method click
 @chainable
 */
WebElement.prototype.click = function() {
    this.POST("/session/:sessionId/element/:id/click");
    return this;
};

/**
 Submit a `FORM` element. The submit command may also be applied to any element that is a descendant of a `FORM` element.
 @method submit
 @chainable
 */
WebElement.prototype.submit = function() {
    this.POST("/session/:sessionId/element/:id/submit");
    return this;
};

/**
 Send a sequence of key strokes to an element.
 @method val
 @chainable
 */
WebElement.prototype.val = function(value) {
    this.POST("/session/:sessionId/element/:id/value", {
        value: Array.isArray(value) ? value : value.split('')
    });
    return this;
};

/**
 Get the value of an element's attribute.
 @method attr
 @param {String} attributeName Attribute name
 @return {String|null} The value of the attribute, or `null` if it is not set on the element.
 */
WebElement.prototype.attr = function(attributeName) {
    return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/attribute/:name".replace(":name", attributeName)));
};

/**
 Query the value of an element's computed CSS property.
 @method css
 @param {String} propertyName CSS property name.
 The CSS property to query should be specified using the CSS property name, not the JavaScript property name (e.g. background-color instead of backgroundColor).
 @return {String} The value of the specified CSS property.
 */
WebElement.prototype.css = function(propertyName) {
    return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/css/:propertyName".replace(":propertyName", propertyName)));
};

/**
 Test if the elements refer to the same DOM element.
 @method equals
 @param {WebElement} other The other element to match with
 @return {Boolean} Whether the two IDs refer to the same element.
 */
WebElement.prototype.equals = function(other) {
    return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/equals/:other".replace(":other", other.element.ELEMENT)));
};

/**
 Determine an element's location on the page. The point (0, 0) refers to the upper-left corner of the page.
 The element's coordinates are returned as a JSON object with x and y properties.
 @method offset
 @return {x:number, y:number} The X and Y coordinates for the element on the page.
 */
WebElement.prototype.offset = function() {
    return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/location"));
};

/**
 Determine an element's size in pixels. The size will be returned as a JSON object with width and height properties.
 @method size
 @return {width:number, height:number} The width and height of the element, in pixels.
 */
WebElement.prototype.size = function() {
    return this.host.parseResponse(this.GET("/session/:sessionId/element/:id/size"));
};

exports.WebElement = WebElement;