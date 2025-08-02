
// Convert Discord snowflake IDs (64-bit uints returned as a string) to hex representation
// Either returns the 16-char (8 byte) hex string or null if the input was invalid
export const snowflakeToHex = (id: string) => {
  try {
    const idInt = BigInt(id);
    return idInt.toString(16).padStart(16, '0');
  } catch (error) {
    return null
  }  
}

// Convert hex strings back to snowflake ID strings; inverse of above snowflakeToHex
// Also returns null if fails
export const hexToSnowflake = (hex: string) => {
  try {
    const idInt = BigInt('0x' + hex);
    return idInt.toString(10);
  } catch (error) {
    return null
  }
}