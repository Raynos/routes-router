var test = require("tape")
var MockRequest = require("hammock/request")
var MockResponse = require("hammock/response")

var Router = require("../index")

test("use domains", function (assert) {
    var router = Router({ useDomains: true })

    router.addRoute("/hello", function (req, res) {
        res.end("world")
    })

    router(
        new MockRequest({ url: "/hello" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "world")

            assert.end()
        }))
})

test("throw an exception async in handler", function (assert) {
    var router = Router({ useDomains: true, teardown: noop })

    router.addRoute("/throw", function () {
        process.nextTick(function () {
            throw new Error("lulz no")
        })
    })

    router(
        new MockRequest({ url: "/throw" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.statusCode, 500)
            assert.equal(resp.body, JSON.stringify({
                errors: [{
                    message: "lulz no",
                    handlingError: null,
                    attribute: "general"
                }]
            }))

            assert.end()
        }))
})

test("throw an exception in handler", function (assert) {
    var router = Router({ useDomains: true, teardown: noop })

    router.addRoute("/throw", function () {
        throw new Error("lulz no")
    })

    router(
        new MockRequest({ url: "/throw" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.statusCode, 500)
            assert.equal(resp.body, JSON.stringify({
                errors: [{
                    message: "lulz no",
                    handlingError: null,
                    attribute: "general"
                }]
            }))

            assert.end()
        }))
})

// test("add a teardown handler")

// test("emitting error on req")

// test("emitting error on res")

// test("throwing an exception in the domain error handler")

function noop() {}
