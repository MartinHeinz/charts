import * as fs from 'fs';
import parse from 'csv-parse/lib/sync.js';

function array_to_csv(data, out) {
    for (const row of data) {
        let csv_row = row.join(",");
        csv_row += "\n";
        fs.appendFileSync(out, csv_row, {encoding: 'utf8'})
    }
}

function parse_suicide_stats(){
    const content = fs.readFileSync(`../data/who_suicide_statistics.csv`);
    const records = parse(content);

    let result = {};

    for (const row of records) {
        let country = row[0];
        let year = row[1];
        let suicide_no = row[4];
        let population = row[5];
        if (!(country in result)) {
            result[country] = [0, 0];
        }
        if (year === "2013") {
            result[country][0] += Number(suicide_no);
            result[country][1] += Number(population);
        }
    }

    let index = 0;
    let table = [];
    for (let [key, row] of Object.entries(result)) {
        if (row[0] === 0 || row[1] === 0) {
            result[key].push(0);
            continue;
        }
        let ratio = (row[1] / row[0]) / 100000;
        result[key].push(Number(ratio.toFixed(3)));
        index++;

        table.push([key, ...row])
    }
    array_to_csv("../data/who_suicide_stats.csv");
}


function clean_oecd_data(input, output, indicators) {
    let result = [];

    let CHUNK_SIZE = 10 * 1024 * 1024, // 10MB
        buffer = Buffer.alloc(CHUNK_SIZE);

    fs.open(input, 'r', function (err, fd) {
        if (err) throw err;

        function readNextChunk() {
            fs.read(fd, buffer, 0, CHUNK_SIZE, null, function (err, nread) {
                if (err) throw err;

                if (nread === 0) {
                    // done reading file, do any necessary finalization steps

                    fs.close(fd, function (err) {
                        if (err) throw err;
                    });
                    return;
                }

                var data;
                if (nread < CHUNK_SIZE)
                    data = buffer.slice(0, nread);
                else
                    data = buffer;

                data = data.toString().replace(new RegExp('"', 'g'), "");
                let rows = data.split("\n");

                for (let i in rows) {
                    if (indicators.every(item => rows[i].includes(item))) {
                        result.push(rows[i]);
                    }
                }
                fs.writeFileSync(output, result.join(""), {encoding: 'utf8'});
            });
        }

        readNextChunk();
    });
}

// clean_oecd_data('../data/ICT_HH2_13062020143325255.csv', '../data/ICT_HH2_13062020143325255_H1K.csv', ["H1K", "IND_TOTAL"]);
// clean_oecd_data('../data/BROADBAND_DB_11062020214338289.csv', '../data/BROADBAND_DB_11062020214338289_BB-P100-FIB.csv', ["BB-P100-FIB"]);

function parse_oedc_data(file, y, out){
    let content = fs.readFileSync(file, "utf8");
    const records = parse(content);

    let result = [];
    for (const row of records) {
        let year = row[5];  // row[7] for ICT_HH2_13062020143325255_H1K
        let percentage = row[12];  // row[14] for ICT_HH2_13062020143325255_H1K
        let country = row[1];
        console.log(row);
        if (year === y) {
            result.push([country, percentage])
        }
    }
    array_to_csv(result, `../data/${out}`);
}

parse_oedc_data("../data/ICT_HH2_13062020143325255_H1K.csv", "2007", "ICT_HH2_13062020143325255_H1K_2007.csv");
parse_oedc_data("../data/ICT_HH2_13062020143325255_H1K.csv", "2012", "ICT_HH2_13062020143325255_H1K_2012.csv");
parse_oedc_data("../data/ICT_HH2_13062020143325255_H1K.csv", "2019", "ICT_HH2_13062020143325255_H1K_2019.csv");
parse_oedc_data("../data/BROADBAND_DB_11062020214338289_BB-P100-FIB.csv", "2018", "BROADBAND_DB_11062020214338289_BB-P100-FIB_2018.csv");
parse_oedc_data("../data/BROADBAND_DB_11062020214338289_BB-P100-FIB.csv", "2016", "BROADBAND_DB_11062020214338289_BB-P100-FIB_2016.csv");
parse_suicide_stats();
