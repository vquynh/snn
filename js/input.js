// load current chart package
google.charts.load("current", {
    packages: ["corechart", "line"]
});
// set callback function when api loaded
google.charts.setOnLoadCallback(drawCharts);
let numSynapses = 30;
let spikingFrequency = 20;
let inputDuration = 200; // duration of stimulation (T) in ms
let timeStep = 1; // duration of each time step (dt) in ms
let resistance = 1; //Ohm
let charge = 1;
let spikingRate = 0.05; //spike per ms
let potential = 0;
const restPotential = 0; // mV
let potentialThreshold = 1; //mV
let restTimeConstant = 1; //ms
let membraneTimeConstant = 4; //ms
let refractoryPeriod = 0;
let maxSpikes = 10;
let synapticTimeConstant = 10;
let synapseHasSpiked = new Array(numSynapses);
let spikesBySynapse = new Array(numSynapses).fill(new Array(maxSpikes).fill(-1));

const inputGraphOptions = {
    title: "Input current",
    hAxis: {
        title: "Time (ms)",
        maxValue: 200
    },
    vAxis: {
        title: "Current (mA)"
    }
};
const potentialGraphOptions = {
    title: "Membrane Potential ",
    hAxis: {
        title: "Time (ms)",
        maxValue: 200
    },
    vAxis: {
        title: "Membrane Potential (mV)"
    }
};

const spikeChartOptions = {
    title: "Synaptic spikes ",
    hAxis: {title: 'Time (ms)', maxValue: 200},
    vAxis: {title: 'Synaptic spikes', minValue: 0},
};


let inputData;
let potentialData;
let spikeData;
let inputChart;
let potentialChart;
let spikeChart;
let intervalId;

function getDefaultInputData() {
    return google.visualization.arrayToDataTable([
        ["Time (ms)", "Current (mA)"],
        [0, 0]
    ]);
}

function getDefaultPotentialData() {
    return google.visualization.arrayToDataTable([
        ["Time (ms)", "Potential (mV)"],
        [0, 0]
    ]);
}

function getDefaultSpikesData() {
    return google.visualization.arrayToDataTable([
        ['Time (ms)', 'Synaptic spikes'],
        [ 0,      0]
    ]);
}

function updateCharts(step) {
    return function () {
        // instead of this random, you can make an ajax call for the current cpu usage or what ever data you want to display
        console.log("update charts with numSynapses: ", numSynapses);
        let inputDelayPeriod = 10;
        let currentTimeMark = timeStep * step;

        // Calculate input and potential in the active input period
        if (inputDelayPeriod < currentTimeMark && currentTimeMark < inputDuration - inputDelayPeriod ) {
            synapseHasSpiked = new Array(numSynapses);
            // assign the boolean value of whether the synapse has spiked
            for (let i = 0; i < numSynapses; i++) {
                // The boolean value is determined by choosing a random number between [0,1]
                // and if it is lower than the probability of a spike over the time interval
                // which is equal to the spiking frequency divided by 1000ms then a spike occurred.
                synapseHasSpiked[i] = Math.random() < spikingFrequency/1000;
            }
            let input = getInput();
            console.log("input", input);
            console.log("currentTimeMark", currentTimeMark);
            let potential = getPotential(input);

            inputData.addRow([currentTimeMark, input]);
            potentialData.addRow([currentTimeMark, potential]);
            spikeData.addRow([currentTimeMark, synapseHasSpiked.filter(spiked => spiked === true).length]);
        } else {
            inputData.addRow([currentTimeMark, 0]);
            potentialData.addRow([currentTimeMark, 0]);
            spikeData.addRow([currentTimeMark, 0]);
        }
        if (currentTimeMark === inputDuration) {
            inputData = getDefaultInputData();
            potentialData = getDefaultPotentialData();
            spikeData = getDefaultSpikesData();
            step = 0;
            resetMemory();
        }
        inputChart.draw(inputData, inputGraphOptions);
        potentialChart.draw(potentialData, potentialGraphOptions);
        spikeChart.draw(spikeData, spikeChartOptions);
        step++;
    };
}

function drawCharts() {
    // draw charts on load
    inputData = getDefaultInputData();
    potentialData = getDefaultPotentialData();
    spikeData = getDefaultSpikesData();

    inputChart = new google.visualization.LineChart(
        document.getElementById("input")
    );
    potentialChart = new google.visualization.LineChart(
        document.getElementById("potential")
    );
    spikeChart = new google.visualization.ScatterChart(
        document.getElementById('spikes'));

    inputChart.draw(inputData, inputGraphOptions);
    potentialChart.draw(potentialData, potentialGraphOptions);
    spikeChart.draw(spikeData, spikeChartOptions);

    // interval for adding new data every 250ms
    let index = 0;
    // draw charts on interval
    intervalId = setInterval(
        updateCharts(index), 250);

    // add event listeners for chart config changes
    addEventListeners();
}

function resetMemory() {
    synapseHasSpiked = new Array(numSynapses).fill(false);
    spikesBySynapse = new Array(numSynapses).fill(new Array(maxSpikes).fill(-1));
}

function addEventListeners(){
    document.getElementById('numSynapses').addEventListener('change',
            event => updateNumSynapses(event), false);
    document.getElementById('spikingFrequency').addEventListener('change',
            event => updateSpikingFrequency(event), false);
}

function updateNumSynapses(event){
    updateValue(event, "numSynapses");
}

function updateSpikingFrequency(event){
    updateValue(event, "spikingFrequency");
}

function updateValue(event, elementId){
        const value = Number(event.target.value);
        let innerText;
        if(elementId === "numSynapses"){
            numSynapses = value;
            innerText = "Number of synapses: " + value;
        }else{
            spikingFrequency = value;
            innerText =  "Spiking frequency: " + value + "Hz";
        }
        clearInterval(intervalId);
        inputData = getDefaultInputData();
        potentialData = getDefaultPotentialData();
        spikeData = getDefaultSpikesData();
        resetMemory();
        document.getElementById(elementId+"Value").innerText = innerText;
        intervalId = setInterval(
            updateCharts(0), 250);
}

// def update_spike_times(self):
//
//         # Increase the age of older spikes
//         old_spikes_op = self.t_spikes.assign_add(tf.where(self.t_spikes >=0,
//                                                           tf.constant(1.0, shape=[self.max_spikes, self.n_syn]) * self.dt,
//                                                           tf.zeros([self.max_spikes, self.n_syn])))
//
//         # Increment last spike index (modulo max_spikes)
//         new_idx_op = self.t_spikes_idx.assign(tf.mod(self.t_spikes_idx + 1, self.max_spikes))
//
//         # Create a list of coordinates to insert the new spikes
//         idx_op = tf.constant(1, shape=[self.n_syn], dtype=tf.int32) * new_idx_op
//         coord_op = tf.stack([idx_op, tf.range(self.n_syn)], axis=1)
//
//         # Create a vector of new spike times (non-spikes are assigned a negative time)
//         new_spikes_op = tf.where(self.syn_has_spiked,
//                                  tf.constant(0.0, shape=[self.n_syn]),
//                                  tf.constant(-1.0, shape=[self.n_syn]))
//
//         # Replace older spikes by new ones
//         return tf.scatter_nd_update(old_spikes_op, coord_op, new_spikes_op)
function updateSpikeTimes(){
    console.log("spikesBySynapse before update: ", spikesBySynapse);
    // Increase the age of older spikes
    for (let synapse = 0; synapse < numSynapses; synapse++) {
        for (let i = 0; i < maxSpikes; i++) {
            // a spike will have a non negative value while non-spike have a negative one (=-1)
            if(spikesBySynapse[synapse][i] >= 0){
                // increase the time value of the spike
                spikesBySynapse[synapse][i] = spikesBySynapse[synapse][i]+1;
            }else {
                break;
            }
        }
    }

    // adding new spikes
    for (let synapse = 0; synapse < numSynapses; synapse++){
        // remove the oldest spike
        spikesBySynapse[synapse].shift();
        // add the new spike
        spikesBySynapse[synapse].push(synapseHasSpiked[synapse] ? 0 : -1);
    }
    console.log("spikesBySynapse after update: ", spikesBySynapse);
}

function getSynapticInput(){
    let input = 0;
    for (let synapse = 0; synapse < numSynapses; synapse++) {
        for (let spike = 0; spike < maxSpikes; spike++){
            let spikeTime = spikesBySynapse[synapse][spike];
            let spikeInput;
            if(spikeTime >= 0){
                console.log("spikeTime: ", spikeTime);
                spikeInput = (charge/synapticTimeConstant)*(Math.exp(-spikeTime/synapticTimeConstant));
            }else {
                spikeInput = 0;
            }
            input = input + spikeInput;
        }
    }
    return input;
}

function getInput(){
    // Update our memory of spike times with the new spikes
    updateSpikeTimes();

    // Evaluate synaptic input current for each spike on each synapse
    return getSynapticInput()

}

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
    if (refractoryPeriod > 0){
        updateRestingBehaviour();
    } else if (potential > potentialThreshold){
        updateFiringBehaviour();
    } else {
        updateIntegrationBehaviour(input);
    }
    return potential;
}

function stopInterval(){
    clearInterval(intervalId);
}
