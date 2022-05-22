// create an array with nodes
let numNeurons = 100;

window.addEventListener("load", () => {
    drawNetwork();
});

function getNodes(){
    let nodes = new vis.DataSet();
    for (let i = 0; i < numNeurons; i++) {
        nodes.add({id: i, label: "Neuron" + i});
    }
    return nodes;
}

function getEdges(){
    let edges = new vis.DataSet();
    let numSynapses = Number(document.getElementById("numSynapses").getAttribute("value"));
    for (let i = 0; i < numNeurons; i++) {
        for (let syn = 0; syn < numSynapses/5; syn++){
            let dest =  Math.floor(Math.random() * numNeurons);
            edges.add({from: i, to: dest});
        }
    }
    return edges;
}

// create a network
function drawNetwork(){
    var container = document.getElementById("network");
    var data = {
        nodes: getNodes(),
        edges: getEdges()
    };
    var options = {};
    var network = new vis.Network(container, data, options);
}

function updateNeurons(event){
    numNeurons = Number(event.target.value);
    document.getElementById("numNeuronsValue").innerText = "Number of neurons: " + numNeurons;
    drawNetwork();
}

document.getElementById("numNeurons").addEventListener("change",
        event => updateNeurons(event), false);