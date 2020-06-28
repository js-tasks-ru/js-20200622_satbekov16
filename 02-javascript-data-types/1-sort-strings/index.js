/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = [];
  if(param === "asc") {
    result = sortAsc(arr);
  } else if (param === "desc" ) {
    result = sortDesc(arr);
  }
  return result;
}

function sortAsc(arr) {
  return arr.slice(0).sort((a, b) =>
    a.localeCompare(b, undefined, {sensitivity: 'case', caseFirst: 'upper'}));
}

function sortDesc(arr) {
  return arr.slice(0).sort((a, b) =>
    b.localeCompare(a, undefined, {sensitivity: 'case', caseFirst: 'upper'}));
}
