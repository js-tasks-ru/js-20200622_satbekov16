/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let counter = 1;
  let result = "";
  for(let i = 0; i < string.length; i++) {
    let start = i;
    while(i + 1 < string.length && string.charAt(i) === string.charAt(i + 1)) {
      i++;
      counter++;
    }
    if(counter >= size) {
      result += string.substr(start, size);
    } else {
      result += string.substr(start, counter);
    }
    counter = 1;
  }
  return result;
}

