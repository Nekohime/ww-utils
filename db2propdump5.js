#!/usr/bin/env node

/*
* WIP: There's an issue with newlines in name, desc, action
* Emojis should also be stripped :v
*/

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const cmToMRatio = 0.01;
const tenthDegToRadRatio = Math.PI / 180.0 * 0.1;

// Open the database
const db = new sqlite3.Database('wideworlds.sqlite3');

// Query to retrieve all entries from a table (replace 'your_table' with the actual table name)
const query = 'SELECT * FROM prop';

// Execute the query
db.all(query, [], (err, rows) => {
  if (err) {
    console.error(err.message);
    throw err;
  }

  // Write the retrieved data to a JSON file

  const outputFile = 'propterra_v5.txt';
  fs.writeFileSync(outputFile, 'propdump version 5\n');


  //const json = JSON.stringify(rows, null, 2);
  rows.forEach((entry, i) => {
    let out = {
      id: 8, // entry.userId,
      time: Math.floor(entry.date / 1000),
      x: Math.round(entry.x / cmToMRatio),
      y: Math.round(entry.y / cmToMRatio),
      z: Math.round(entry.z / cmToMRatio),

      yaw: Math.round(entry.yaw / tenthDegToRadRatio),
      pitch: Math.round(entry.pitch / tenthDegToRadRatio),
      roll: Math.round(entry.roll / tenthDegToRadRatio),
      propType: 0,


      nameLength: entry.name.length,
      descriptionLength: entry.description.length,
      actionLength: entry.action.length,
      dataLength: 0,

      namedescaction: (entry.name + entry.description + entry.action).replace(/\n/g, '\x80\x7F'),

      propData: '',
    }
    const outputFilePropLine = out.id + ' ' +
        out.time + ' ' +
        out.x + ' ' +
        out.y + ' ' +
        out.z + ' ' +
        out.yaw + ' ' +
        out.pitch + ' ' +
        out.roll + ' ' +
        out.propType + ' ' +
        out.nameLength + ' ' +
        out.descriptionLength + ' ' +
        out.actionLength + ' ' +
        out.dataLength + ' ' +
        out.namedescaction +
        out.propData

        fs.appendFileSync(
          outputFile,
          outputFilePropLine + '\n');

    //console.log(`Data written to ${outputFile}`);

  });

  /*
  v5 schema:
  id, time, x, y, z, yaw, pitch, roll, proptype, namelen, desclen, actionlen, datalen, namedescactiondata
  */


  // Close the database connection
  db.close();
});
