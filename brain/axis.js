
export default class Axis {

  constructor(minInclusive, min, max, maxInclusive) {
    this.isAxis = true;
    this.minInclusive = minInclusive;
    this.min = min;
    this.max = max;
    this.maxInclusive = maxInclusive;
  }

  get(input) {
    if (input === undefined) return undefined;
    if (input < this.min) return 0;
    if (!this.minInclusive && (input === this.min)) return 0;
    if (!this.maxInclusive && (input === this.max)) return 0;
    if (input > this.max) return 0;

    return 1;
  }

  contains(axis) {
    if (axis && axis.isAxis) {
      if (axis.min < this.min) return false;
      if ((axis.min === this.min) && axis.minInclusive && !this.minInclusive) return false;
      if ((axis.max === this.max) && axis.maxInclusive && !this.maxInclusive) return false;
      if (axis.max > this.max) return false;
    } else {
      if (!(axis <= Infinity)) return false;
      if (axis < this.min) return false;
      if ((axis === this.min) && !this.minInclusive) return false;
      if ((axis === this.max) && !this.maxInclusive) return false;
      if (axis > this.max) return false;
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
