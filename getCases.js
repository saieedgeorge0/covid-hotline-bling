const fs = require('fs');
let rawdata = fs.readFileSync('zip2fips.json');
let zip2fips = JSON.parse(rawdata);

const getCases = async (zipcode) => {
    console.log(`getting cases for ${zipcode}...`);
    console.log(`${zip2fips[zipcode]}`);
    return 0;
};

module.exports = getCases;