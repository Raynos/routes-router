var sendError = require("send-data/error")

module.exports = createDefaultHandler

function createDefaultHandler(opts) {
    var notFound = opts.notFound || defaultNotFound
    var errorHandler = opts.errorHandler || defaultErrorHandler

    return {
        createHandler: createHandler
    }

    function createHandler(req, res) {
        return defaultHandler

        function defaultHandler(err) {
            if (err) {
                if (err.statusCode === 404) {
                    return notFound(req, res)
                }

                errorHandler(req, res, err)
            }
        }
    }
}

function defaultErrorHandler(req, res, err) {
    sendError(req, res, {
        body: err,
        statusCode: err.statusCode || 500
    })
}

function defaultNotFound(req, res) {
    res.statusCode = 404
    res.end("404 Not Found")
}
