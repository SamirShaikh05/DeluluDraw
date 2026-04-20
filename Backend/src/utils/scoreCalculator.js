function guessPoints(orderIndex) {
  return Math.max(20, 100 - orderIndex * 20);
}

function drawerPoints() {
  return 20;
}

module.exports = {
  drawerPoints,
  guessPoints,
};
