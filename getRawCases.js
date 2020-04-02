const fs = require('fs');
const http = require('https');
const csv = require('csvtojson');

const getRawCases = async () => {
    var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
        file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
    };
    download('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv', 'casedata.csv');
    await new Promise(resolve => setTimeout(resolve, 2500));

    const casedatajson = await csv().fromFile('casedata.csv');
    console.log(casedatajson.length);
    for(var i = 0; i < casedatajson.length; i++) {
        casedatajson[i]['cases'] = parseInt(casedatajson[i]['cases']);
        casedatajson[i]['deaths'] = parseInt(casedatajson[i]['deaths']);
    }

    return casedatajson;
}

module.exports = getRawCases;