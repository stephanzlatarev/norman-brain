Neural network for infinite training data sets.

### Brain

The brain is a neural network with extensible set of neurons of the following types:
* **Sensor**s are neurons that are activated solely from external stimuli.
* **Conceptron**s are neurons that cluster other neurons and activate when at least one of the connected neurons is active.

The conceptrons grow within the brain in the process of learning through training.
Adding new sensors to the brain doesn't change what it has previously learned.

##### Neuron

Every neuron has:
* **Activation** - a value in the (-∞, +∞) interval.
* **Label** - a unique textual label.

##### Sensor

The sensor is a neuron.
Its label represents an external property.
Its activation reflects the input to the brain from that external property.

##### Conceptron

The conceptron is a neuron that additionally has:
* **Neurons** - a list of connected neurons.
* **Perceptrons** - a list of perceptrons, where each perceptron activates on specific range of input from the connected neurons.

Its label represents a concept.
It activates when at least one of its perceptrons is activated by the connected neurons.

### Trainining

Training data sets consist of samples where each sample maps input activations to concept activations.
For simplicity, the samples are structured as pairs of one input tensor and one output tensor where the data set meta maps textual labels to positions in the tensors.

At the start of the training, the brain grows sensors for the inputs and conceptrons for the outputs.
During the training, the brain is given samples from the infinite training data set. It will adjust an improve its performance.
The training is complete when the brain performs well for a given number of samples in a row.

A conceptron that is part of the output is considered to be learning.

When the output in a sample doesn't match the activation of a learning conceptron, then the conceptron will adjust by either:
* adjusting one of its perceptrons by either:
    * expanding it to include the input
    * splitting it in two perceptrons to exclude the input
* adding an existing neuron to its list of connected neurons
* splitting the conceptron into a cluster of conceptrons (one playbook is split into pages)

The number of perceptrons of a conceptron may grow a lot when learning to match the specific configurations of the training set.
Reducing the granularity of the samples reduces the number of perceptrons required for learning them.
In the [concentric waves](./demo/concentric-waves.js) demo the brain cannot learn the waves perfectly without the rounding of the samples.

### Outlook

* The brain can explain its output for a given input by listing the activated concepts and detailing each with the perceptions that activated them. The explanation is a tree of concepts with raw data (images) as leaves.
* Growing a new conceptron should only happen with labelling the newly introduced concept. Labels can be given by a supervisor or teacher when the brain cannot learn something and asks for explanation. Labels can be derived from other conceptrons, for example "red house" or "domesticated wolf".
    * When there is a supervisor and the brain cannot learn more, then it should ask for explanation. the supervisor can focus on an intermediate concept (introducing a new concept) or can allow the brain to increase in size (letting the brain memorize more samples).
    * When there is no supervisor and the brain cannot learn more, then identify a subset of the training data set and create a conceptron of what's learned (one page of the playbook) and leave the rest to other conceptrons.
* Switch between expanding and contract phases, either based on the appearance of matching and non-matching samples, or based on thresholds, or both, to optimize the size of the brain. When the conceptron performs well it should contract. When it performs bad it should expand.
* As the brain can handle unknown inputs and unknown activations, then it can play games in turns by gradually adding known inputs, e.g. one sample is all steps are unknown - respond with first step, another sample is only first step is known - respond with seconds step, etc.
* The brain can generate images by activating one or more concepts and then tickle down activations to the sensors and showing what raw input data would activate the given concepts.
* The brain should be able to work on graphs of input data. maybe perceptrons can have a pattern of abstract links that can dynamically match neurons. When the perceptron can match more than one set of neurons to the pattern, then the pattern should state whether the brain will choose one match or whether all matches will be processed independently eiher in sequence or in parallel.
* A memory is a (temporary) neuron that copies a perceptron with its activation and the activations of its linked neurons all the way to the raw input data of the sensors.
* A goal is a neuron with static connections to other neurons, i.e. doesn't learn. It activates when at least one of them is active. Deactivates otherwise.
* A calculator is a neuron with static connections to other neurons, i.e doesn't learn. Activates based on a math function of the input neurons.
