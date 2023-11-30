const fs = require('fs');

const isValidLine = line => !line || !line[0].match(/[a-zA-Z]/) ? false : true;

/**
 * Represents an avatar with various properties.
 * @class
 */
class AvatarList {
  /**
   * Initializes a new instance of the AvatarList class.
   * @constructor
   */
  constructor() {
    this.name = '';
    this.model = '';
    this.implicitAnimations = {};
    this.explicitAnimations = {};
  }
}


/**
 * Reads avatar data from a given input string.
 * @class
 */
class AvatarListReader {
  /**
   * Initializes a new instance of the AvatarList class.
   * @param {string} input - The input string containing avatar configuration data.
   * @constructor
   */
  constructor(input) {
    /** @member {Array<Avatar>} */
    this.avatars = [];
    /** @member {Array<string>} */
    this.lines = input.split('\n');
    this.totalLines = this.lines.length;

    while (this.lines.length > 0) {
      // Get the current line and remove comments
      const line = this.lines.shift().split('#')[0].trim();

      // Skip empty lines and lines that don't start with a letter
      if (!isValidLine(line)) continue;

      try {
        // If the line indicates the start of an avatar block
        if (line === 'avatar') {
          const av = this.readAvatar();
          // If a valid avatar is obtained, add it to the avatars array
          if (av !== null) {
            this.avatars.push(av);
          }
        }
      } catch (error) {
        // Log and rethrow errors with line numbers
        const lineNumber = this.totalLines - this.lines.length;
        console.error(`Error on line ${lineNumber}: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Reads key-value pairs until an end marker is encountered.
   * @param {string} end - The end marker that signals the end of the key-value list.
   * @return {Object} - The key-value pairs read from the input.
   */
  parseKeyValueList(end) {
    /** @type {Object} */
    const results = {};
    while (this.lines.length > 0) {
      const line = this.lines.shift().trim();

      // Skip empty lines and lines that don't start with a letter
      if (!isValidLine(line)) continue;

      // If the end marker is encountered, stop reading
      if (line === end) {
        break;
      }

      // Split the line into key and value and add to results
      const [key, value] = line.split('=');
      results[key] = value;
    }
    return results;
  }

  /**
   * Reads an entire avatar block.
   * @return {Avatar|null} - The parsed avatar object or null if the avatar is invalid.
   */
  readAvatar() {
    /** @type {Avatar} */
    const avatarList = new AvatarList();
    while (this.lines.length > 0) {
      // Get the current line and remove comments
      const line = this.lines.shift().split('#')[0].trim();
      // Split the line into parts
      const parts = line.split('=');

      // Skip empty lines and lines that don't start with a letter
      if (!isValidLine(line)) continue;

      // Process different sections of the avatar block
      if (parts[0] === 'name' && parts.length > 1) {
        avatarList.name = parts[1];
      } else if (parts[0] === 'geometry' && parts.length > 1) {
        avatarList.model = parts[1];
      } else if (line === 'endavatar') {
        break;
      } else if (line === 'beginimp') {
        avatarList.implicitAnimations = this.parseKeyValueList('endimp');
      } else if (line === 'beginexp') {
        avatarList.explicitAnimations = this.parseKeyValueList('endexp');
      }
    }

    // Return the avatar only if it has a valid name
    return avatarList.name.length > 0 ? avatarList : null;
  }
}

/**
 * Maps an Avatar object to a simplified format.
 * @param {AvatarList} avatar - The avatar list object to be mapped.
 * @return {Object} - The mapped avatar object.
 */
function mapAvatar({name, model, implicitAnimations, explicitAnimations}) {
  return {
    name,
    model: `${model}`,
    implicitAnimations,
    explicitAnimations,
  };
}

try {
  // Check if a file path is provided as a command-line argument
  if (process.argv.length < 3) {
    throw new Error('Please provide the input file as a command-line argument.');
  }

  // Read input data from a file
  const inputData = fs.readFileSync(process.argv[2], 'utf-8');
  // Create an instance of AvatarListReader to process the input
  const reader = new AvatarListReader(inputData);

  // Filter out avatars with empty model paths and map the avatars
  const avatars = reader.avatars
      .filter((a) => a.model.length > 0)
      .map(mapAvatar);

  // Output the resulting avatars in JSON format
  console.log(JSON.stringify({avatars}, null, 2));
} catch (error) {
  // Log errors during file reading or processing
  console.error(`Error reading or processing the file: ${error.message}`);
}
