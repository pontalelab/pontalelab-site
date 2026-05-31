function toAngleDeg(point, center) {
  var dx = point.x - center.x;
  var dy = point.y - center.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function calcRotationDelta(prevPoint, currentPoint, center) {
  var prev = toAngleDeg(prevPoint, center);
  var curr = toAngleDeg(currentPoint, center);
  var delta = curr - prev;
  if (delta >  180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}
