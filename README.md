# Spiking neural network visualisation
An interactive visualisation of spiking neural network

## How to use
- Go to [SNN Visualisation](https://vquynh.github.io/snn)
- A default visualisation of SNN with number of synapses = 100 will start
  - You can stop the visualisation with the `Stop` button. However, the visualisation cannot continue on that stopped 
  point, so you will have to start the visualisation from t=0 again with the `Refresh` button
- Change the parameter to see how the visualisation changes
  - Everytime the parameter changes, the visualisation will start from t=0

## How the visualisation is built
### SNN simulation with the leaky integrate-and-fire (LIF) model
- The visualisation uses the leaky integrate-and-fire model as described in the article
[Leaky Integrate and Fire neuron with Tensorflow](http://www.kaizou.org/2018/07/lif-neuron-tensorflow.html) by David Corvoysier
to simulate a spiking neural network.
- Based on the above-mentioned article, the membrane potential are calculated as followed in Javascript:

```javascript
// Neuron behaviour during integration phase (below threshold)
function updateIntegrationBehaviour(input){
  // du = ((-u(t) + rI(t)) * dt)/tau
  let potentialPerTimeUnit = (resistance*input - potential)/membraneTimeConstant;
  // Update membrane potential
  // u = du*dt
  potential = potentialPerTimeUnit*timeStep
  // Refractory period is 0
  refractoryPeriod = 0;
}

// Neuron behaviour during firing phase (above threshold)
function updateFiringBehaviour(){
  // Reset membrane potential
  potential = restPotential;
  // Refractory (rest) period starts now
  refractoryPeriod = restTimeConstant;
}

// Neuron behaviour during resting phase (t_rest > 0)
function updateRestingBehaviour(){
  // Membrane potential stays at u_rest
  potential = restPotential;
  // Refractory period is decreased by dt
  refractoryPeriod = refractoryPeriod - timeStep;
}

function getPotential(input){
        // when in refractory (resting) period
    if (refractoryPeriod > 0){
        updateRestingBehaviour();
        // when potential exceed the threshold
    } else if (potential > potentialThreshold){
        updateFiringBehaviour();
        // otherwise the potential just accumulate over time
    } else {
        updateIntegrationBehaviour(input);
    }
    return potential;
}

```


### Visualisation of input current and membrane potential with Google Charts
[Google Charts](https://developers.google.com/chart) is used to visualise the synaptic input current and 
the membrane potential in "real-time". 

### Visualisation of neural networks with vis.js
Inspired by the article [Asynchronous Neural Networks in JavaScript](https://desalasworks.com/article/asynchronous-neural-networks-in-javascript/) 
by Steven de Salas, this visualisation uses [vis.js](https://visjs.org) to visualise the spiking neural network.

### Hosting and documentation with GitHub Pages
The visualisation and the documentation are hosted using [GitHub Pages](https://pages.github.com)
