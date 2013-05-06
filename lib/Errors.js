var Errors = {
    6: function() {
        this.name = "NoSuchDriver";
        this.message = "A session is either terminated or not started";
        this.code = 6;
    },
    7: function() {
        this.name = "NoSuchElement";
        this.message = "An element could not be located on the page using the given search parameters.";
        this.code = 7;
    },
    8: function() {
        this.name = "NoSuchFrame";
        this.message = "A request to switch to a frame could not be satisfied because the frame could not be found.";
        this.code = 8;
    }
};

Object.keys(Errors).forEach(function(errorId) {
    Errors[errorId].prototype = new Error();
    Errors[errorId].prototype.constructor = Errors[errorId];
});

Object.freeze(Errors);

exports.Errors = Errors;