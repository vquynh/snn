// create an array with nodes
var nodes = new vis.DataSet([
    { id: 1, label: "Neuron 1" },
    { id: 2, label: "Neuron 2" },
    { id: 3, label: "Neuron 3" },
    { id: 4, label: "Neuron 4" },
    { id: 5, label: "Neuron 5" }
]);

// create an array with edges
var edges = new vis.DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 }
]);

// create a network
var container = document.getElementById("network");
var data = {
    nodes: nodes,
    edges: edges
};
var options = {};
var network = new vis.Network(container, data, options);