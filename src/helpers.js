// this wraps an async express route handler function into a try-catch
// it returns a new function which handles failures gracefully 
// by sending a JSON encoded message and a HTTP 500 (internal server error) status code
function expressTryCatchWrapper(fn) {
    return async function (req, resp) {
        try {
            await fn(req, resp)
        } catch (ex) {
            console.error('expressTryCatch ERROR', ex)
            resp.status(500).json({
                message: 'SERVER_ERROR',
                info: ex.toString()
            })
        }
    }
}

const convertDatesToTimestamps = record => {
    return
    ['start_date', 'estimated_due_date', 'completion_date'].forEach(fieldName => {
        if (record[fieldName]) {
            // record[fieldName] = (new Date(record[fieldName])).getTime()
            record[fieldName] = (new Date(record[fieldName])).toISOString()
            console.log(`${fieldName}, ${record[fieldName]}`)
        }
    })
}

const timestampsToDates = record => {
    ['start_date', 'estimated_due_date', 'completion_date'].forEach(fieldName => {
        if (record[fieldName]) {
            record[fieldName] = (new Date(record[fieldName])).toUTCString()
            console.log(`${fieldName}, ${record[fieldName]}`)
        }
    })
}


module.exports = {
    convertDatesToTimestamps,
    timestampsToDates,
    expressTryCatchWrapper,
}
