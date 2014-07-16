var test = require("tape")
var Router = require("../index.js")
var MockRequest = require("hammock/request")
var MockResponse = require("hammock/response")

function createRouters() {
    var child = Router()
    child.addRoute("/", function (req, res) {
        res.end(req.url)
    })
    child.addRoute("/bar", function (req, res) {
        res.end(req.url)
    })

    var parent = Router()

    parent.prefix("/foo", child)

    return parent
}

test("can add prefix router", function (assert) {
    var router = createRouters()

    router(
        MockRequest({ url: "/foo/" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "/foo/")

            assert.end()
        })
    )
})

test("prefix supports nested uris", function (assert) {
    var router = createRouters()

    router(
        MockRequest({ url: "/foo/bar" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "/foo/bar")

            assert.end()
        })
    )
})

test("prefix supports root uris", function (assert) {
    var router = createRouters()

    router(
        MockRequest({ url: "/foo" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "/foo")

            assert.end()
        })
    )
})

test("child not found handler", function (assert) {
    var child = Router()
    child.addRoute("*", function (req, resp) {
        resp.statusCode = 404
        resp.end("custom not found")
    })

    var parent = Router()
    parent.prefix("/foo", child)

    parent(
        MockRequest({ url: "/foo" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.statusCode, 404)
            assert.equal(resp.body, "custom not found")

            parent(
                MockRequest({ url: "/foo/" }),
                MockResponse(function (err, resp) {
                    assert.ifError(err)

                    assert.equal(resp.statusCode, 404)
                    assert.equal(resp.body, "custom not found")

                    assert.end()
                }))
        }))
})

test("child should not be greedy", function (assert) {
    var child = Router()
    child.addRoute("*", function (req, resp) {
        resp.end("all the dogs")
    })

    var parent = Router()

    parent.prefix("/dog", child)
    parent.addRoute("/doge", function (req, resp) {
        resp.end("doge")
    })

    parent(
        MockRequest({ url: "/doge" }),
        MockResponse(function (err, resp) {
            assert.ifError(err)

            assert.equal(resp.body, "doge")

            assert.end()
        }))
})
