// load current chart package
google.charts.load("current", {
    packages: ["corechart", "line"]
});
// set callback function when api loaded
google.charts.setOnLoadCallback(drawCharts);
let numSynapses = 100;
let inputDuration = 200; // duration of stimulation (T) in ms
let timeStep = 1; // duration of each time step (dt) in ms
let resistance = 1; //Ohm
let firingRate = 0.005; //spike per second
let potential = 0;
const restPotential = 0; // mV
let potentialThreshold = 1; //mV
let restTimeConstant = 1; //ms
let membraneTimeConstant = 4; //ms
let refractoryPeriod = 0;

const inputGraphOptions = {
    title: "Input current",
    hAxis: {
        title: "Time (ms)"
    },
    vAxis: {
        title: "Current (mA)"
    }
};
const potentialGraphOptions = {
    title: "Membrane Potential ",
    hAxis: {
        title: "Time (ms)"
    },
    vAxis: {
        title: "Membrane Potential (mV)"
    }
};

let inputData;
let potentialData;
let inputChart;
let potentialChart;
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

function updateCharts(step) {
    return function () {
        // instead of this random, you can make an ajax call for the current cpu usage or what ever data you want to display
        console.log("update charts with numSynapses: ", numSynapses);
        let input = getInput(numSynapses);
        let currentTimeMark = timeStep * step;
        let inputDelayPeriod = 10;
        let potential = getPotential(input);

        // Generate random spikes between start and end time mark
        if (inputDelayPeriod < currentTimeMark && currentTimeMark < inputDuration - inputDelayPeriod ) {
            inputData.addRow([currentTimeMark, input]);
            potentialData.addRow([currentTimeMark, potential]);
        } else {
            inputData.addRow([currentTimeMark, 0]);
            potentialData.addRow([currentTimeMark, 0]);
        }
        if (currentTimeMark === inputDuration) {
            inputData = getDefaultInputData();
            potentialData = getDefaultPotentialData();
            step = 0;
        }
        inputChart.draw(inputData, inputGraphOptions);
        potentialChart.draw(potentialData, potentialGraphOptions);
        step++;
    };
}

function drawCharts() {
    // draw charts on load
    inputData = getDefaultInputData();
    potentialData = getDefaultPotentialData();
    inputChart = new google.visualization.LineChart(
        document.getElementById("input")
    );
    potentialChart = new google.visualization.LineChart(
        document.getElementById("potential")
    );
    inputChart.draw(inputData, inputGraphOptions);
    potentialChart.draw(potentialData, potentialGraphOptions);
    // interval for adding new data every 250ms
    let index = 0;

    // draw charts on interval
    intervalId = setInterval(
        updateCharts(index), 250);

    // add event listeners for chart config changes
    addEventListeners();
}

function addEventListeners(){
    document.getElementById('numSynapses').addEventListener('change', (event) => {
       numSynapses = event.target.value;
        console.log("numSynapses from input: ", numSynapses);
        clearInterval(intervalId);
        inputData = getDefaultInputData();
        potentialData = getDefaultPotentialData();
        intervalId = setInterval(
            updateCharts(0), 250);
    }, false);
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
    // Increase the age of older spikes
    // old_spikes_op = self.t_spikes.assign_add(tf.where(self.t_spikes >=0,
    // tf.constant(1.0, shape=[self.max_spikes, self.n_syn]) * self.dt,
    // tf.zeros([self.max_spikes, self.n_syn])))



}

function getInput(numSynapses){
    // # Override parent get_input_op method
    //     def get_input_op(self):
    //
    //         # Update our memory of spike times with the new spikes
    //         t_spikes_op = self.update_spike_times()
    //
    //         # Evaluate synaptic input current for each spike on each synapse
    //         i_syn_op = tf.where(t_spikes_op >=0,
    //                             self.q/self.tau_syn * tf.exp(tf.negative(t_spikes_op/self.tau_syn)),
    //                             t_spikes_op*0.0)
    //
    //         # Add each synaptic current to the input current
    //         i_op =  tf.reduce_sum(self.w * i_syn_op)
    //
    //         return tf.add(self.i_app, i_op)
    return (Math.round(Math.random()) * 2 - 1) * 3;
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
