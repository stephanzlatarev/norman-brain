
export function updateNeighborsOnCreate(perceptron) {
  for (const axis of perceptron.axis) {
    if (!axis.minNeighbors) axis.minNeighbors = [];
    if (!axis.maxNeighbors) axis.maxNeighbors = [];
  }
}

export function updateNeighborsOnTwoWaySplit(minPerceptron, maxPerceptron, splitAxisIndex) {
  const minPerceptronSplitAxis = minPerceptron.axis[splitAxisIndex];
  const maxPerceptronSplitAxis = maxPerceptron.axis[splitAxisIndex];

  const minPerceptronMaxNeighbors = [...minPerceptronSplitAxis.maxNeighbors];
  const maxPerceptronMinNeighbors = [...maxPerceptronSplitAxis.minNeighbors];

  // Disconnect all max neighbors of min perceptron and connect max perceptron
  for (const neighbor of minPerceptronMaxNeighbors) {
    disconnectNeighbors(minPerceptron, neighbor, splitAxisIndex);
  }
  minPerceptronSplitAxis.maxNeighbors = [maxPerceptron];

  // Disconnect all min neighbors of max perceptron and connect min perceptron
  for (const neighbor of maxPerceptronMinNeighbors) {
    disconnectNeighbors(neighbor, maxPerceptron, splitAxisIndex);
  }
  maxPerceptronSplitAxis.minNeighbors = [minPerceptron];

  // For each other axis, remove the neighbors that don't touch anymore
  removeDisconnectedNeighbors(minPerceptron, splitAxisIndex);
  removeDisconnectedNeighbors(maxPerceptron, splitAxisIndex);
}

export function updateNeighborsOnThreeWaySplit(minPerceptron, midPerceptron, maxPerceptron, splitAxisIndex) {
  const minPerceptronSplitAxis = minPerceptron.axis[splitAxisIndex];
  const maxPerceptronSplitAxis = maxPerceptron.axis[splitAxisIndex];
  const midPerceptronSplitAxis = midPerceptron.axis[splitAxisIndex];

  const minPerceptronMaxNeighbors = [...minPerceptronSplitAxis.maxNeighbors];
  const midPerceptronMaxNeighbors = [...midPerceptronSplitAxis.maxNeighbors];
  const midPerceptronMinNeighbors = [...midPerceptronSplitAxis.minNeighbors];
  const maxPerceptronMinNeighbors = [...maxPerceptronSplitAxis.minNeighbors];

  // Disconnect all max neighbors of min perceptron and connect mid perceptron
  for (const neighbor of minPerceptronMaxNeighbors) {
    disconnectNeighbors(minPerceptron, neighbor, splitAxisIndex);
  }
  minPerceptronSplitAxis.maxNeighbors = [midPerceptron];

  // Disconnect all min neighbors of max perceptron and connect mid perceptron
  for (const neighbor of maxPerceptronMinNeighbors) {
    disconnectNeighbors(neighbor, maxPerceptron, splitAxisIndex);
  }
  maxPerceptronSplitAxis.minNeighbors = [midPerceptron];

  // Connect mid perceptron to min and max perceptrons, disconnecting all other neighbors
  for (const neighbor of midPerceptronMinNeighbors) {
    disconnectNeighbors(neighbor, midPerceptron, splitAxisIndex);
  }
  midPerceptronSplitAxis.minNeighbors = [minPerceptron];
  for (const neighbor of midPerceptronMaxNeighbors) {
    disconnectNeighbors(midPerceptron, neighbor, splitAxisIndex);
  }
  midPerceptronSplitAxis.maxNeighbors = [maxPerceptron];

  // For each other axis, remove the neighbors that don't touch anymore
  removeDisconnectedNeighbors(minPerceptron, splitAxisIndex);
  removeDisconnectedNeighbors(midPerceptron, splitAxisIndex);
  removeDisconnectedNeighbors(maxPerceptron, splitAxisIndex);
}

function removeDisconnectedNeighbors(perceptron, touchAxisIndex) {
  const axisCount = perceptron.axis.length;
  const perceptronTouchAxis = perceptron.axis[touchAxisIndex];

  for (let i = 0; i < axisCount; i++) {
    if (i === touchAxisIndex) continue;

    const perceptronAxis = perceptron.axis[i];
    const minNeighbors = [...perceptronAxis.minNeighbors];
    const maxNeighbors = [...perceptronAxis.maxNeighbors];

    for (const neighbor of minNeighbors) {
      const neighborTouchAxis = neighbor.axis[touchAxisIndex];

      if (!perceptronTouchAxis.touches(neighborTouchAxis)) {
        disconnectNeighbors(neighbor, perceptron, i);
      }
    }

    for (const neighbor of maxNeighbors) {
      const neighborTouchAxis = neighbor.axis[touchAxisIndex];

      if (!perceptronTouchAxis.touches(neighborTouchAxis)) {
        disconnectNeighbors(perceptron, neighbor, i);
      }
    }
  }
}

export function updateNeighborsOnMergeAtMinSide(perceptron, neighbors, mergeAxisIndex) {
  const axisCount = perceptron.axis.length;
  const mergeNeighbors = [...neighbors];

  for (let i = 0; i < axisCount; i++) {
    const perceptronAxis = perceptron.axis[i];
    const minNeighbors = [...perceptronAxis.minNeighbors];
    const maxNeighbors = [...perceptronAxis.maxNeighbors];

    if (i === mergeAxisIndex) {
      for (const mergeNeighbor of mergeNeighbors) {
        disconnectNeighbors(mergeNeighbor, perceptron, i);

        for (const maxNeighbor of maxNeighbors) {
          connectNeighbors(mergeNeighbor, maxNeighbor, i);
        }
      }

      for (const maxNeighbor of maxNeighbors) {
        disconnectNeighbors(perceptron, maxNeighbor, i);
      }
    } else {
      for (const minNeighbor of minNeighbors) {
        disconnectNeighbors(minNeighbor, perceptron, i);

        for (const mergeNeighbor of mergeNeighbors) {
          connectNeighbors(minNeighbor, mergeNeighbor, i);
        }
      }

      for (const maxNeighbor of maxNeighbors) {
        disconnectNeighbors(perceptron, maxNeighbor, i);

        for (const mergeNeighbor of mergeNeighbors) {
          connectNeighbors(mergeNeighbor, maxNeighbor, i);
        }
      }
    }
  }
}

export function updateNeighborsOnMergeAtMaxSide(perceptron, neighbors, mergeAxisIndex) {
  const axisCount = perceptron.axis.length;
  const mergeNeighbors = [...neighbors];

  for (let i = 0; i < axisCount; i++) {
    const perceptronAxis = perceptron.axis[i];
    const minNeighbors = [...perceptronAxis.minNeighbors];
    const maxNeighbors = [...perceptronAxis.maxNeighbors];

    if (i === mergeAxisIndex) {
      for (const minNeighbor of minNeighbors) {
        disconnectNeighbors(minNeighbor, perceptron, i);
      }

      for (const mergeNeighbor of mergeNeighbors) {
        disconnectNeighbors(perceptron, mergeNeighbor, i);

        for (const minNeighbor of minNeighbors) {
          connectNeighbors(minNeighbor, mergeNeighbor, i);
        }
      }
    } else {
      for (const minNeighbor of minNeighbors) {
        disconnectNeighbors(minNeighbor, perceptron, i);

        for (const mergeNeighbor of mergeNeighbors) {
          connectNeighbors(minNeighbor, mergeNeighbor, i);
        }
      }

      for (const maxNeighbor of maxNeighbors) {
        disconnectNeighbors(perceptron, maxNeighbor, i);

        for (const mergeNeighbor of mergeNeighbors) {
          connectNeighbors(mergeNeighbor, maxNeighbor, i);
        }
      }
    }
  }
}

function connectNeighbors(minNeighbor, maxNeighbor, index) {
  const axisCount = minNeighbor.axis.length;

  for (let i = 0; i < axisCount; i++) {
    const minNeighborAxis = minNeighbor.axis[i];
    const maxNeighborAxis = maxNeighbor.axis[i];

    if (i === index) {
      if (minNeighborAxis.max !== maxNeighborAxis.min) return;
      if (minNeighborAxis.maxInclusive === maxNeighborAxis.minInclusive) return;
    } else {
      if (!minNeighborAxis.touches(maxNeighborAxis)) return;
    }
  }

  addMinNeighbor(maxNeighbor, minNeighbor, index);
  addMaxNeighbor(minNeighbor, maxNeighbor, index);
}

function disconnectNeighbors(minNeighbor, maxNeighbor, axisIndex) {
  const minNeighbors = maxNeighbor.axis[axisIndex].minNeighbors;
  const minNeighborIndex = minNeighbors.indexOf(minNeighbor);

  if (minNeighborIndex >= 0) {
    minNeighbors.splice(minNeighborIndex, 1);
  }

  const maxNeighbors = minNeighbor.axis[axisIndex].maxNeighbors;
  const maxNeighborIndex = maxNeighbors.indexOf(maxNeighbor);

  if (maxNeighborIndex >= 0) {
    maxNeighbors.splice(maxNeighborIndex, 1);
  }
}

function addMinNeighbor(perceptron, neighbor, axisIndex) {
  const neighbors = perceptron.axis[axisIndex].minNeighbors;
  const neighborIndex = neighbors.indexOf(neighbor);

  if (neighborIndex < 0) {
    neighbors.push(neighbor);
  }
}

function addMaxNeighbor(perceptron, neighbor, axisIndex) {
  const neighbors = perceptron.axis[axisIndex].maxNeighbors;
  const neighborIndex = neighbors.indexOf(neighbor);

  if (neighborIndex < 0) {
    neighbors.push(neighbor);
  }
}
