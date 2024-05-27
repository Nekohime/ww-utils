# WW-Utils

Some tools related to [WideWorlds](https://github.com/Blaxar/WideWorlds)

## Instructions

Run this commands to install dependencies  
`npm install`


## db2propdump5.js

Exports a WideWorlds world into a valid AW v5 Propdump (utf8)

### Usage

`./db2propdump5.js [options]`  
`./db2propdump5.js --database mydatabase.sqlite3`  
`./db2propdump5.js --citizen 42`  
`./db2propdump5.js --database mydatabase.sqlite3 --citizen 42`  

Options...
- `--database` or `-d` <db.sqlite3> (default: wideworlds.sqlite3)
  - The WideWorlds database file
- `--citizen` or `-c` <1337> (default: 1)
  - Overrides ALL props' Citizen IDs
  - Default behaviour is to ***NOT*** override if this option isn't used
