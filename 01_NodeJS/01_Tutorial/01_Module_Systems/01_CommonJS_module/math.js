function sum(...arr) {
  return arr.reduce((curr, acc) => curr + acc);
}

function product(...arr) {
  return arr.reduce((curr, acc) => curr * acc);
}

module.exports = {
  sum,
  product,
};
