var test = require("tape");
var MockRequest = require("hammock/request");
var MockResponse = require("hammock/response");

var Router = require("../index")

test("routes-router is a function", function (assert) {
    assert.equal(typeof Router, "function")
    assert.end()
})

test("can create a router", function (assert) {
    var router = Router()

    router.addRoute("/foo", function (req, res) {
        res.end("bar")
    })

    router(
        new MockRequest({ url: "/foo" }),
        new MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "bar")

            assert.end()
        })
    )
})

require("./simple-routes.js")
require("./child-routes.js")
