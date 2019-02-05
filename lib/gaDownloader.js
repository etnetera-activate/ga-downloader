const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const commandLineOptions = require('./commandLineOptions.js')
const moment = require('moment')

process.env.DEBUG = "activate*"; //HACK - allways print debug
const debug = require('debug')('activate:ga-downloader')

const {
    google
} = require('googleapis')


exports.parseCommandLineAndDownloadGaData = parseCommandLineAndDownloadGaData;

function parseCommandLineAndDownloadGaData(){
    try {
        var options = commandLineArgs(commandLineOptions.optionDefinitions)
        var valid =
            options._all.help || (
                options._all.profileId &&
                options._all.dateFrom &&
                options._all.metrics
            )
        if (!valid) {
            throw ("Invalid options: " + JSON.stringify(options._all))
        }
    
        //default
        if (!options._all.dateTo) options._all.dateTo = options._all.dateFrom
    
    } catch (e) {
        debug(e)
        let usage = commandLineUsage(commandLineOptions.usageSections)
        console.log(usage)
        process.exit(-1)
    }

    downloadGaData(options._all)
}

function downloadGaData(options){
    const key = require(options.authFile)
    const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
    const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)

    process.env.GOOGLE_APPLICATION_CREDENTIALS = './auth.json'
    downloadAllDays(options, jwt)
}

//main controler
async function downloadAllDays(options,jwt) {
    debug("Starting download with options: %O", options)
    let workDate = moment(options.dateFrom)
    while (workDate.isSameOrBefore(options.dateTo)) {
        let out = await downloadOneDay(workDate, options, jwt)
        //debug(out)
        workDate.add(1, "day")
    }
}

function downloadOneDay(date, options, jwt) {
    return new Promise((resolve, reject) => {
        debug("Downloading day data: %s", date.format("YYYY-MM-DD"))
        jwt.authorize((err, response) => {
            getAndPrintData({
                auth: jwt,
                ids: 'ga:' + options.profileId,
                'start-date': date.format('YYYY-MM-DD'),
                'end-date': date.format('YYYY-MM-DD'),
                'max-results': 10000,
                metrics: options.metrics,
                dimensions: options.dimensions
            },options).then((out) => {
                resolve(out)
            })
        })

    })
}

function getAndPrintData(config,options) {
    return new Promise((resolve, reject) => {
        getAndPrintDataRacursively(config, options, resolve, reject)
    })
}

function getAndPrintDataRacursively(config, options, resolve, reject){
    google.analytics('v3').data.ga.get(
        config,
        (err, result) => {
            //console.log(err, result)

            if (err) {
                console.log(err)
            }

            if (result.data.rows) {
                let sampledData = result.data.containsSampledData;
                let totalResult = result.data.totalResults;
                let itemPerPage = result.data.itemsPerPage;
                let startIndex = result.data.query['start-index']

                if (sampledData) {
                    debug("[Warning] Sampled data")
                }

                debug("Downloaded  %d / %d", result.data.rows.length + startIndex - 1, totalResult)
                printData(config['start-date'],result.data, options.format)

                if (result.data.nextLink) {
                    let nextConfig = JSON.parse(JSON.stringify(config));
                    nextConfig['auth'] = jwt
                    nextConfig['start-index'] = startIndex + itemPerPage
                    getAndPrintDataRacursively(nextConfig,options, resolve, reject)
                } else {
                    resolve({
                        status: "ok"
                    })
                }
            }
        }
    )    
}


/************ formaters, helpers, ... */
var headersPrinted = false;
function printData(date, data, printFormat) {
    let headers = [{name:'date', type:"Date"}]
    for (var i = 0; i < data.columnHeaders.length; i++) {
        headers[i+1] = {}
        headers[i+1].name = data.columnHeaders[i].name.replace("ga:", "")
        if (headers[i+1].name === "date") {
            headers[i+1].type = "Date"
        } else if (data.query.metrics.indexOf("ga:" + headers[i+1].name) != -1) {
            headers[i+1].type = "Numeric"
        } else {
            headers[i+1].type = "String"
        }
    }

    if (printFormat === "CSV") {
        if (!headersPrinted) {
            headersPrinted=true;
            console.log(headers.map(item => item.name).join(','))
        }
        data.rows.forEach(row => {
            let drow = [date].concat(row)
            let printrow = transformRow(headers, drow, printFormat)
            console.log(printrow)
        });
    } else if (printFormat = "BQJSON") {
        //TODO
    }
}

function transformRow(headers, row, printFormat) {
    if (printFormat === "CSV") {
        let out = []
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].type === "Date") {
                out.push(
                    moment(row[i], "YYYYMMDD").format("YYYY-MM-DD 00:00:00")
                )
            } else if (headers[i].type === "Numeric") {
                out.push(row[i])
            } else if (headers[i].type === "String") {
                out.push(`"${row[i].replace(/"/g,"''")}"`)
            }
        }
        return out.join(',')
    }
}