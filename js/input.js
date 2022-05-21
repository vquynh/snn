// load current chart package
google.charts.load("current", {
    packages: ["corechart", "line"]
});
// set callback function when api loaded
google.charts.setOnLoadCallback(drawCharts);
let numSynapses = 100;
let firingIndex = 0;
let weight = 0.07;
let resistance = 1;
let firingRate = 0.002;
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

function updateCharts(index) {
    return function () {
        // instead of this random, you can make an ajax call for the current cpu usage or what ever data you want to display
        console.log("update charts with numSynapses: ", numSynapses);
        let input = getInput(numSynapses);
        let currentTimeMark = 5 * index;
        let inputDuration = 400;
        let restPeriod = 10;
        let potential = getPotential(input);

        // Generate random spikes between start and end time mark
        if (restPeriod < currentTimeMark && currentTimeMark < restPeriod + inputDuration) {
            inputData.addRow([currentTimeMark, input]);
            potentialData.addRow([currentTimeMark, potential]);
        } else {
            inputData.addRow([currentTimeMark, 0]);
            potentialData.addRow([currentTimeMark, 0]);
        }
        if (currentTimeMark === inputDuration + 10 * restPeriod) {
            inputData = getDefaultInputData();
            potentialData = getDefaultPotentialData();
            index = 0;
        }
        inputChart.draw(inputData, inputGraphOptions);
        potentialChart.draw(potentialData, potentialGraphOptions);
        index++;
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
    return Math.random() * numSynapses + 20;
}

function getPotential(input){
    // # Neuron behaviour during integration phase (below threshold)
    //     def get_integrating_op(self):
    //
    //         # Get input current
    //         i_op = self.get_input_op()
    //
    //         # Update membrane potential
    //         du_op = tf.divide(tf.subtract(tf.multiply(self.r, i_op), self.u), self.tau)
    //         u_op = self.u.assign_add(du_op * self.dt)
    //         # Refractory period is 0
    //         t_rest_op = self.t_rest.assign(0.0)
    //
    //         return u_op, t_rest_op
    //
    //     # Neuron behaviour during firing phase (above threshold)
    //     def get_firing_op(self):
    //
    //         # Reset membrane potential
    //         u_op = self.u.assign(self.u_rest)
    //         # Refractory period starts now
    //         t_rest_op = self.t_rest.assign(self.tau_rest)
    //
    //         return u_op, t_rest_op
    //
    //     # Neuron behaviour during resting phase (t_rest > 0)
    //     def get_resting_op(self):
    //
    //         # Membrane potential stays at u_rest
    //         u_op = self.u.assign(self.u_rest)
    //         # Refractory period is decreased by dt
    //         t_rest_op = self.t_rest.assign_sub(self.dt)
    //
    //         return u_op, t_rest_op
    //
    //     def get_potential_op(self):
    //
    //         return tf.case(
    //             [
    //                 (self.t_rest > 0.0, self.get_resting_op),
    //                 (self.u > self.u_thresh, self.get_firing_op),
    //             ],
    //             default=self.get_integrating_op
    //         )
    return Math.random() * input;
}

function updateSpikeTimes(){
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
}

function stopInterval(){
    clearInterval(intervalId);
}
