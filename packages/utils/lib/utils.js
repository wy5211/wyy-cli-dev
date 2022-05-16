module.exports = {
  isObject,
};

function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}
