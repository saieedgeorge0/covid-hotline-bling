const fs = require('fs');
let rawdata = fs.readFileSync('zip2fips.json');
let zip2fips = JSON.parse(rawdata);
const http = require('https');
const csv = require('csvtojson');

const getCases = async (zipcode) => {
    console.log(`getting cases for ${zipcode}...`);
    console.log(`${zip2fips[zipcode]}`);

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
    download('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv', 'casedata.csv')
    await new Promise(resolve => setTimeout(resolve, 500));

    const casedatajson = await csv().fromFile('casedata.csv');
    const recentdate = casedatajson[caseadatajson.length-1]['date'];
    for(var i = 0; i < casedatajson.length; i++) {
    delete casedatajson[i]['date'];
    delete casedatajson[i]['county'];
    delete casedatajson[i]['state'];
    casedatajson[i]['cases'] = parseInt(casedatajson[i]['cases']);
    casedatajson[i]['deaths'] = parseInt(casedatajson[i]['deaths']);
    }

    casedatajson2 = [];
    casedatajson.forEach(function(obj) {
    var id = obj.fips
    if(!this[id]) casedatajson2.push(this[id] = obj);
    else {
        this[id].cases += obj.cases;
        this[id].deaths += obj.deaths;
    }
    }, Object.create(null));

    fipswewant = {};
    for (let index in casedatajson2){
    let curObj = casedatajson2[index];
    if(curObj.fips === zip2fips[zipcode]){
        fipswewant = curObj;
    }
    }
    console.log(fipswewant);

    return fipswewant, recentdate;
};

module.exports = getCases;