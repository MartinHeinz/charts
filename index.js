const os = require('os');
const fs = require('fs').promises;
const parse = require('csv-parse/lib/sync');

(async function(){
    const content = await fs.readFile(`./data/emissions.csv`);
    // Parse the CSV content
    const records = parse(content);
    // Print records to the console
    // records.map( record => console.log(record) );

    let countries = records.map(function(value, index) { return value[0]; });
    let values = records.map(function(value, index) { return value[2]; });

    console.log(countries);
    console.log(values);
})();