# Spiking neural network visualisation
An interactive visualisation of spiking neural network

## How to use
- Go to [SNN Visualisation](https://vquynh.github.io/snn)
- A default visualisation of SNN with number of synapses = 30 and spiking frequency = 20 will start.
  - The `Number of synapses` parameter is the number of synapses through which a neuron is connected to the input neuron.
  - The `Spiking frequency` parameter is the frequency at which each synapse spikes according to an independent poisson process.
  - You can stop the visualisation with the `Stop` button. However, the visualisation cannot continue on that stopped 
  point, so you will have to start the visualisation from t=0 again with the `Refresh` button
- Change the parameters to see how the visualisation changes
  - Everytime the parameter changes, the visualisation will start from t=0

## Interpretation
- Increasing the `number of synapses` as well as the `spiking frequency` of the synapses both increases the 
synaptic input and thus increases the membrane potential, making the neuron spikes more often.
- There are other factors that can have positive effect on the number of spikes, such as the `neuron synaptic charge (q)`, 
the `synaptic efficacy (w)` and the `maximum number of spikes` that can be remembered. 
Whereas other factors, such as the `synaptic time constant` or `rest time constant` have negative effect on the spikes.
For simplicity's sake, in this visualisation, these parameters are hard-coded.

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
the membrane potential, so it looks like they are changing in real-time. This was done by updating the charts in 250ms 
interval with new data points.

```javascript
function drawCharts() {
    ...
    // draw charts on interval
    intervalId = setInterval(
        updateCharts(index), 250);
}
```

### Visualisation of neural networks with vis.js (work-in-progress)
Inspired by the article [Asynchronous Neural Networks in JavaScript](https://desalasworks.com/article/asynchronous-neural-networks-in-javascript/) 
by Steven de Salas, this visualisation uses [vis.js](https://visjs.org) to visualise the spiking neural network.

### Hosting and documentation with GitHub Pages
The visualisation and the documentation are hosted using [GitHub Pages](https://pages.github.com)
