/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = []
  if(param === "asc") {
    arr.sort((a, b) =>
      a.localeCompare(b, undefined, {sensitivity: 'case', caseFirst: 'upper'}))
    for(let i = 0; i < arr.length; i++) {
      result[i] = arr[i];
    }
    return result;
  } else if (typeof param === 'undefined' || param === "desc" ) {
    arr.sort((a, b) =>
      b.localeCompare(a, undefined, {sensitivity: 'case', caseFirst: 'upper'}));
    for(let i = 0; i < arr.length; i++) {
      result[i] = arr[i];
    }
    return result;
  }
}
