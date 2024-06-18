const NODE_COLORS = {
    "superstar": "#FF4444",
    "associate": "#99FF99",
    "collaborator": "#666666"
}

async function getData(page) {
    let rawData = await (await fetch(`graphs/${page}.json`)).json();

    let res = {
        nodes: Object.keys(rawData.nodes).map(x => {
            return {
                data: {
                    id: `n_${x}`,
                    citationCount: rawData.nodes[x].citation_count,
                    authorName: rawData.nodes[x].author_name,
                    type: rawData.nodes[x].type,
                    color: NODE_COLORS[rawData.nodes[x].type]
                }
            }
        }),
        edges: Object.keys(rawData.edges).map(x => Object.keys(rawData.edges[x]).map(y => {
            return {
                data: {
                    id: `e_${x}_${y}`,
                    source: `n_${x}`,
                    target: `n_${y}`,
                    weight: rawData.edges[x][y].length
                }
            }
        })).flat()
    }

    return res;
}

let cy = undefined;

let switching = false;

var current_selected_page = "art";

async function refreshCytoscape(page) {
    if(cy) {
        await cy.destroy();
    }

    cy = cytoscape({

        container: document.getElementById('cy'), // container to render in
      
        elements: getData(page),
      
        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                'background-color': 'data(color)',
                'label': 'data(authorName)'
                }
            },
        
            {
                selector: 'edge',
                style: {
                'width': 3,
                'line-color': '#ccc',
                'curve-style': 'bezier'
                }
            }
        ],
      
        layout: {
          name: 'cose',
          animate: false
        }
    });
}

function switchPage(page) {
    if (page != current_selected_page && !switching) {
        switching = true;
        refreshCytoscape(page);
        document.getElementById("button-" + current_selected_page).className = "";
        document.getElementById("button-" + page).className = "button-selected";
        current_selected_page = page;
        switching = false;
    }
}

// Register click events for the tab selectors
document.getElementById("button-art").onclick = () => switchPage("art");
document.getElementById("button-computer_science").onclick = () => switchPage("computer_science");
document.getElementById("button-engineering").onclick = () => switchPage("engineering");
document.getElementById("button-history").onclick = () => switchPage("history");
document.getElementById("button-law").onclick = () => switchPage("law");
document.getElementById("button-physics").onclick = () => switchPage("physics");

refreshCytoscape("art");