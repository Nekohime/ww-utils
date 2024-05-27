#!/usr/bin/env node

// IMPORTANT NOTE: WideWorlds' propdump importing tool is currently lossy.
//  v4 objects will not be saved in its database.
// Therefore, this tool cannot retrieve any v4 objects.

import sqlite3 from 'sqlite3';
import * as fs from 'fs';

// Constants for conversion
const cmToMRatio = 0.01;
const tenthDegToRadRatio = Math.PI / 180.0 * 0.1;

// Helper function to calculate byte size
const byteSize = (str) => Buffer.byteLength(str, 'utf8');

/**
 * Replaces newline characters in a string with the specified hex code
 *  using buffer operations.
 * Known to work fine.
 *
 * @param {string} inputString - The input string to be processed.
 * @return {string} - The processed string with newline characters replaced.
 */
function codeNL(inputString) {
  const buffer = Buffer.from(inputString, 'utf8');
  // Allocate a buffer with double size to handle extra characters
  const outputBuffer = Buffer.alloc(buffer.length * 2);

  let i = 0;
  let j = 0;

  while (i < buffer.length) {
    if (buffer[i] === 0x0D && buffer[i + 1] === 0x0A) { // '\r\n'
      outputBuffer[j++] = 128;
      outputBuffer[j++] = 127;
      i += 2;
    } else if (buffer[i] === 0x0A) { // '\n'
      outputBuffer[j++] = 127;
      i++;
    } else {
      outputBuffer[j++] = buffer[i++];
    }
  }

  return outputBuffer.slice(0, j).toString('utf8');
}

/**
 * Formats a database entry into the required output string.
 *
 * @param {Object} entry - The database entry to be formatted.
 * @param {number} [citizenId=1] - The citizen ID to be used
 *  in the formatted output.
 * @return {string} - The formatted output string.
 */
function formatOutput(entry, citizenId) {
  if (!citizenId) citizenId = entry.userId;
  const time = Math.floor(entry.date / 1000);

  const x = Math.round(entry.x / cmToMRatio);
  const y = Math.round(entry.y / cmToMRatio);
  const z = Math.round(entry.z / cmToMRatio);

  const yaw = Math.round(entry.yaw / tenthDegToRadRatio);
  const pitch = Math.round(entry.pitch / tenthDegToRadRatio);
  const roll = Math.round(entry.roll / tenthDegToRadRatio);

  const propType = 0; // NYI in WideWorlds

  const name = entry.name;
  const description = codeNL(entry.description);
  const action = codeNL(entry.action);

  const nameLength = byteSize(name);
  const descriptionLength = byteSize(description);
  const actionLength = byteSize(action);
  const dataLength = 0; // NYI in WideWorlds

  const namedescaction = name + description + action;

  const propData = ''; // NYI in WideWorlds

  return [
    citizenId,
    time,
    x, y, z,
    yaw, pitch, roll,
    propType,
    nameLength, descriptionLength, actionLength, dataLength,
    namedescaction,
    propData,
  ].join(' ');
}

/**
 * Writes content to a file.
 *
 * @param {string} filename - The name of the file to write to.
 * @param {string} content - The content to be written to the file.
 */
function writeToFile(filename, content) {
  fs.appendFileSync(filename, Buffer.from(content + '\n', 'utf8'));
}

/**
 * Parses command-line arguments and returns an options object.
 *
 * @return {Object} - An object containing parsed command-line options.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    database: 'wideworlds.sqlite3',
  };

  args.forEach((arg, index) => {
    if (arg === '--database' || arg === '-d') {
      options.database = args[index + 1];
    }
    if (arg === '--citizen' || arg === '-c') {
      options.citizen = parseInt(args[index + 1], 10);
    }
  });

  return options;
}

const options = parseArgs();
const db = new sqlite3.Database(options.database);

db.all('SELECT * FROM prop', [], (err, rows) => {
  if (err) {
    console.error(err.message);
    throw err;
  }

  const outputFile = 'propterra_v5.txt';
  fs.writeFileSync(outputFile, Buffer.from('propdump version 5\n', 'utf8'));

  rows.forEach((entry) => {
    const outputLine = formatOutput(entry, options.citizen);
    writeToFile(outputFile, outputLine);
  });

  db.close();
});
