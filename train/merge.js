import { updateNeighborsOnMergeAtMinSide, updateNeighborsOnMergeAtMaxSide } from "./neighbors.js";

export default function merge(conceptron, perceptrons) {
  let wave = new Set(perceptrons);
  const skip = new Set();

  while (wave.size) {
    const next = new Set();

    for (const perceptron of wave) {
      if (skip.has(perceptron)) continue;

      const neighbors = getAreaNeighbors(perceptron);
      const dissolved = mergeOne(perceptron);

      if (dissolved) {
        if (dissolved.positive) {
          conceptron.positive.delete(dissolved);
        } else {
          conceptron.negative.delete(dissolved);
        }

        for (const neighbor of neighbors) {
          next.add(neighbor);
        }

        skip.add(dissolved);
      }
    }

    wave = next;
  }
}

function mergeOne(perceptron) {
  for (let axisIndex = 0; axisIndex < perceptron.axis.length; axisIndex++) {
    const axis = perceptron.axis[axisIndex];

    // Attempt merge at the min side of the perceptron
    if (!axis.minNeighbors.length) {
      // There are no neighbors at the min side. Cannot merge.
    } else if (axis.minNeighbors.length === 1) {
      // There is exactly one neighbor at the min side. The perceptron may merge into the neighbor or the neighbor may merge into the perceptron and other neighbors
      if (mergeOneIntoManyAtMinSide(perceptron, axis.minNeighbors, axisIndex)) return perceptron;

      const neighbor = axis.minNeighbors[0];
      const neighborsMaxNeighbors = neighbor.axis[axisIndex].maxNeighbors;
      if (mergeOneIntoManyAtMaxSide(neighbor, neighborsMaxNeighbors, axisIndex)) return neighbor;
    } else {
      // There are many neighbors at the min side. The perceptron may merge into the neighbors if possible.
      if (mergeOneIntoManyAtMinSide(perceptron, axis.minNeighbors, axisIndex)) return perceptron;
    }

    // Attempt merge at the max side of the perceptron
    if (!axis.maxNeighbors.length) {
      // There are no neighbors at the max side. Cannot merge.
    } else if (axis.maxNeighbors.length === 1) {
      // There is exactly one neighbor at the max side. The perceptron may merge into the neighbor or the neighbor may merge into the perceptron and other neighbors
      if (mergeOneIntoManyAtMaxSide(perceptron, axis.maxNeighbors, axisIndex)) return perceptron;

      const neighbor = axis.maxNeighbors[0];
      const neighborsMinNeighbors = neighbor.axis[axisIndex].minNeighbors;
      if (mergeOneIntoManyAtMinSide(neighbor, neighborsMinNeighbors, axisIndex)) return neighbor;
    } else {
      // There are many neighbors at the max side. The perceptron may merge into the neighbors if possible.
      if (mergeOneIntoManyAtMaxSide(perceptron, axis.maxNeighbors, axisIndex)) return perceptron;
    }

  }
}

function mergeOneIntoManyAtMinSide(perceptron, neighbors, axisIndex) {
  if (isSameType(perceptron, neighbors) && isSameSurface(perceptron, neighbors, axisIndex)) {
    doMergeAtMinSide(perceptron, neighbors, axisIndex);
    updateNeighborsOnMergeAtMinSide(perceptron, neighbors, axisIndex);
    return true;
  }
}

function mergeOneIntoManyAtMaxSide(perceptron, neighbors, axisIndex) {
  if (isSameType(perceptron, neighbors) && isSameSurface(perceptron, neighbors, axisIndex)) {
    doMergeAtMaxSide(perceptron, neighbors, axisIndex);
    updateNeighborsOnMergeAtMaxSide(perceptron, neighbors, axisIndex);
    return true;
  }
}

function isSameType(perceptron, neighbors) {
  return !!neighbors.length && !neighbors.find(neighbor => (neighbor.positive !== perceptron.positive));
}

function isSameSurface(perceptron, neighbors, axisIndex) {
  for (let i = 0; i < perceptron.axis.length; i++) {
    if (i === axisIndex) continue;

    const perceptronAxis = perceptron.axis[i];

    for (const neighbor of neighbors) {
      if (!perceptronAxis.contains(neighbor.axis[i])) {
        return false;
      }
    }
  }

  return true;
}

// Merges the given perceptron into the given neighbors.
// After the operation the neighbors will span the space of the perceptron
// and the perceptron may be released.
function doMergeAtMinSide(perceptron, neighbors, axisIndex) {
  const perceptronAxis = perceptron.axis[axisIndex];

  for (const neighbor of neighbors) {
    const neighborAxis = neighbor.axis[axisIndex];

    neighborAxis.max = perceptronAxis.max;
    neighborAxis.maxInclusive = perceptronAxis.maxInclusive;

    if (perceptronAxis.coremax !== undefined) neighborAxis.coremax = perceptronAxis.coremax;
  }
}

function doMergeAtMaxSide(perceptron, neighbors, axisIndex) {
  const perceptronAxis = perceptron.axis[axisIndex];

  for (const neighbor of neighbors) {
    const neighborAxis = neighbor.axis[axisIndex];

    neighborAxis.min = perceptronAxis.min;
    neighborAxis.minInclusive = perceptronAxis.minInclusive;

    if (perceptronAxis.coremin !== undefined) neighborAxis.coremin = perceptronAxis.coremin;
  }
}

function getAreaNeighbors(perceptron) {
  const neighbors = new Set();
  const direct = getDirectNeighbors(perceptron);

  for (const neighbor of direct) {
    const indirect = getDirectNeighbors(neighbor);

    neighbors.add(neighbor);

    for (const one of indirect) {
      neighbors.add(one);
    }
  }

  return neighbors;
}

function getDirectNeighbors(perceptron) {
  const neighbors = new Set();

  for (const axis of perceptron.axis) {
    for (const neighbor of axis.minNeighbors) {
      neighbors.add(neighbor);
    }

    for (const neighbor of axis.maxNeighbors) {
      neighbors.add(neighbor);
    }
  }

  return neighbors;
}
