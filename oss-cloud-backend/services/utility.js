
// function to check if arrays are equal
function arraysEqual(_arr1, _arr2) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2)
   || _arr1.length !== _arr2.length) { return false; }

  const arr1 = _arr1.concat().sort();
  const arr2 = _arr2.concat().sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) { return false; }
  }

  return true;
}

// checks if body can be parsed with JSON and contains required attributes
// returns boolean valid, error or succes message, and parsed body
module.exports.checkBody = (body, attributes) => {
  try {
    const bodyObject = JSON.parse(body);
    console.log('body', bodyObject);
    console.log('attributes', attributes);
    if (arraysEqual(Object.keys(bodyObject), attributes)) {
      return [true, 'Body is valid', bodyObject];
    }
    return [false, 'Attributes not matching', {}];
  } catch (e) {
    return [false, e.message, {}];
  }
};
