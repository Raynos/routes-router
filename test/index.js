var test = require("tape")

var routes-router = require("../index")

test("routes-router is a function", function (assert) {
    assert.equal(typeof routes-router, "function")
    assert.end()
})
