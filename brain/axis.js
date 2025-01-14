
export default class Axis {

  constructor(minInclusive, min, max, maxInclusive) {
    this.isAxis = true;
    this.minInclusive = minInclusive;
    this.min = min;
    this.max = max;
    this.maxInclusive = maxInclusive;
  }

  contains(input) {
    if (input && input.isAxis) {
      const axis = input;

      if (axis.min < this.min) return false;
      if ((axis.min === this.min) && axis.minInclusive && !this.minInclusive) return false;
      if ((axis.max === this.max) && axis.maxInclusive && !this.maxInclusive) return false;
      if (axis.max > this.max) return false;
    } else {
      if (!(input <= Infinity)) return false;
      if (input < this.min) return false;
      if ((input === this.min) && !this.minInclusive) return false;
      if ((input === this.max) && !this.maxInclusive) return false;
      if (input > this.max) return false;
    }

    return true;
  }

  touches(axis) {
    if (axis.max < this.min) return false;
    if ((axis.max === this.min) && (!axis.maxInclusive || !this.minInclusive)) return false;
    if ((axis.min === this.max) && (!axis.minInclusive || !this.maxInclusive)) return false;
    if (axis.min > this.max) return false;

    return true;
  }

  size() {
    return this.max - this.min;
  }

}
