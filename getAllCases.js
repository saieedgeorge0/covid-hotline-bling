const fs = require('fs');
let rawdata = fs.readFileSync('zip2fips.json');
let zip2fips = JSON.parse(rawdata);
const http = require('https');
const csv = require('csvtojson');

const getAllCases = async () => {
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
    await new Promise(resolve => setTimeout(resolve, 500));

    const casedatajson = await csv().fromFile('casedata.csv');
    for(var i = 0; i < casedatajson.length; i++) {
        if (casedatajson[i]['county'] == 'New York City') {
            casedatajson[i]['fips'] = "36061";
        }
        casedatajson[i]['cases'] = parseInt(casedatajson[i]['cases']);
        casedatajson[i]['deaths'] = parseInt(casedatajson[i]['deaths']);
    }

    mostuptodatecasedata = [];
    for(var i = 0; i < casedatajson.length; i++) {
        if (mostuptodatecasedata.some(item => item.fips === casedatajson[i]['fips'])) {
            for(var j = 0; j < mostuptodatecasedata.length; j++) {
                if (mostuptodatecasedata[j].fips === casedatajson[i].fips) {
                    mostuptodatecasedata[j] = casedatajson[i];
                }
            }
        }
        else {
            if (casedatajson[i]['fips'] != "") {               
                mostuptodatecasedata.push(casedatajson[i]);
            }
        }
    }

    return mostuptodatecasedata;
}

module.exports = getAllCases;