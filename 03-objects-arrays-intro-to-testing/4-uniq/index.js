/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const set = new Set();
  if(arr) {
    arr.forEach(item =>
      set.add(item)
    );
  }
  const array = (set.size === 0) ? new Array() : Array.from(set);
  return array;
}
