var domain = require("domain");

var Router = require("./index.js")

module.exports = DomainRouter

function DomainRouter(opts) {
    opts = opts || {}

    var teardown = opts.teardown || rethrow;

    var router = Router(opts)

    handleRequest.addRoute = router.addRoute
    handleRequest.routes = router.routes
    handleRequest.routeMap = router.routeMap
    handleRequest.match = router.match
    handleRequest.defaultHandler = router.defaultHandler
    return handleRequest

    function handleRequest(req, res, opts, callback) {
        if (typeof opts === "function") {
            callback = opts;
            opts = null;
        }

        opts = opts || {}
        callback = callback || handleRequest.defaultHandler
            .createHandler(req, res)

        runDomain()

        function runDomain() {
            var d = domain.create();
            d.add(req);
            d.add(res);
            d.on("error", function (err) {
                err.handlingError = null
                try {
                    callback(err);
                } catch (error) {
                    err.handlingError = error
                    if (!res.finished) {
                        res.end()
                    }
                }
                d.exit();
                teardown(err);
            });
            try {
                d.run(function () {
                    router(req, res, opts, callback)
                });
            } catch (error) {
                d.exit()
                d.emit("error", error)
            }
        }
    }
}


function rethrow(err) {
    process.nextTick(function () {
        // fix the process.domain stack
        if (process.domain) {
            process.domain.exit()
        }
        throw err
    })
}
