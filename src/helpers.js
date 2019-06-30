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
/**
 * 
 * @param {*} users an user object or an array of those
 */
function hidePassword(users) {
    (Array.isArray(users) ? users : [users]).forEach(u => u.password = '__SERVER_SUPRESSED__')
}

const convertDatesToTimestamps = record => {
    return
    ['start_date', 'estimated_due_date', 'completion_date'].forEach(fieldName => {
        if (record[fieldName]) {
            // record[fieldName] = (new Date(record[fieldName])).getTime()
            record[fieldName] = (new Date(record[fieldName])).toISOString()
            
        }
    })
}

const timestampsToDates = record => {
    ['start_date', 'estimated_due_date', 'completion_date'].forEach(fieldName => {
        if (record[fieldName]) {
            record[fieldName] = (new Date(record[fieldName])).toUTCString()
           
        }
    })
}


module.exports = {
    hidePassword,
    convertDatesToTimestamps,
    timestampsToDates,
    expressTryCatchWrapper,
}
