var ROTATION_THRESHOLD = 720;

function addRotation(currentTotal, delta) {
  return currentTotal + Math.abs(delta);
}

function isRotationComplete(totalRotation, threshold) {
  var t = threshold !== undefined ? threshold : ROTATION_THRESHOLD;
  return totalRotation >= t;
}
