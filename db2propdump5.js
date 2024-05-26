#!/usr/bin/env node

// IMPORTANT NOTE: WideWorlds' propdump importing tool is currently lossy.
//  v4 objects will not be saved in its database.
// Therefore, this tool cannot retrieve any v4 objects.

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const cmToMRatio = 0.01;
const tenthDegToRadRatio = Math.PI / 180.0 * 0.1;
const byteSize = (str) => new Blob([str]).size;

// TODO: CLI Argument to provide the DB filename, with fallback
const db = new sqlite3.Database('wideworlds.sqlite3');

// Query to retrieve all entries from the 'prop' table
const query = 'SELECT * FROM prop';

// Execute the query
db.all(query, [], (err, rows) => {
  if (err) {
    console.error(err.message);
    throw err;
  }

  const outputFile = 'propterra_v5.txt';
  fs.writeFileSync(outputFile, 'propdump version 5\n', {encoding: 'utf8'});

  rows.forEach((entry, i) => {
    entry.description = entry.description.replace(/\n/g, '\x80\x7F');
    entry.action = entry.action.replace(/\n/g, '\x80\x7F');

    const out = {
      // TODO: Add CLI Argument to override the citizen ID on all objects
      id: 8, // entry.userId,
      // WideWorlds stores timestamps in milliseconds
      time: Math.floor(entry.date / 1000),

      x: Math.round(entry.x / cmToMRatio),
      y: Math.round(entry.y / cmToMRatio),
      z: Math.round(entry.z / cmToMRatio),

      yaw: Math.round(entry.yaw / tenthDegToRadRatio),
      pitch: Math.round(entry.pitch / tenthDegToRadRatio),
      roll: Math.round(entry.roll / tenthDegToRadRatio),

      propType: 0,

      nameLength: entry.name.length,
      descriptionLength: byteSize(entry.description),
      actionLength: byteSize(entry.action),
      dataLength: 0,

      namedescaction: (entry.name + entry.description + entry.action),
      propData: '',
    };

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
        out.propData;

    fs.appendFileSync(
        outputFile,
        outputFilePropLine + '\n', {encoding: 'utf8'});
  });

  /*
  v5 schema:
  id, time,
  x, y, z,
  yaw, pitch, roll,
  proptype,
  namelen, desclen, actionlen, datalen,
  namedescactiondata
  */


  // Close the database connection
  db.close();
});
