const optionDefinitions = [{
        name: 'profileId',
        alias: 'p',
        type: String,
        typeLabel: '{underline gaprofileid}',
        description: 'GA profileid',
        group: 'required'
    },
    {
        name: 'dateFrom',
        alias: 'f',
        type: String,
        typeLabel: '{underline YYYY-MM-DD}',
        description: 'first date for reading data. If there is no dateTo, onlu this one day wil be downloaded',
        group: 'required'
    },
    {
        name: 'dateTo',
        alias: 't',
        type: String,
        typeLabel: '{underline YYYY-MM-DD}',
        description: 'last date for readind data. Optional.',
        group: 'optional'
    },
    {
        name: 'dimensions',
        alias: 'd',
        type: String,
        typeLabel: '{underline dimensionString}',
        description: 'dimensions separated by comma. Example: "ga:source,ga:keyword". Don\'t use ga:date',
        group: 'optional'
    },
    {
        name: 'metrics',
        alias: 'm',
        type: String,
        typeLabel: '{underline metricsString}',
        description: 'metrics separated by comma. Example: "ga:sessions,ga:pageviews"',
        group: 'required'
    },
    {
        name: 'authFile',
        alias: 'a',
        type: String,
        typeLabel: '{underline file}',
        description: 'path fo auth file with credentials to Google API.',
        group: 'optional',
        defaultValue: './auth.json'
    },
    {
        name: 'format',
        type: String,
        typeLabel: '{underline "CSV"}',
        description: 'output format. Just now only CSV is supported.',
        group: 'optional',
        defaultValue: 'CSV'
    },


    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.',
        group: 'other'
    }
]

module.exports = {
    optionDefinitions: optionDefinitions,

    usageSections: [{
            header: 'GA Data Downloader',
            content: 'Downloads unsampled GA data day by day for given date range to CSV.'
        },
        {
            header: 'Example',
            content: [
                '$ node gaDownloader.js -p 1234556 -f "2017-01-03" -d "ga:medium" -m "ga:users"',
            ]
        },
        {
            header: 'Required ',
            optionList: optionDefinitions,
            group: ['required']
        },
        {
            header: 'Optional ',
            optionList: optionDefinitions,
            group: ['optional', 'other']
        },
    ]
}