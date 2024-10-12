
  // Initialize the map
  var map = L.map('map').setView([20.593684, 78.96288], 4.3);

  // Add OpenStreetMap tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  //to search
  L.Control.geocoder().addTo(map);

  let geojson;
  let currentLayer = null;  // Store the currently selected state layer
  let stateLayers = {};  // Store reference to all state layers

  // Custom style for the background states with low opacity
  function backgroundStyle(feature) {
    return {
      fillColor: '#ff7800',   // Light gray color for background states
      weight: 1,              // Thinner border
      opacity: 1,             // Border opacity
      color: 'white',         // Border color
      fillOpacity: 0.2        // Low opacity for background states
    };
  }

  // Custom style for the highlighted state
  function highlightStyle(feature) {
    return {
      fillColor: '#ff7800',    // Orange for the selected state
      weight: 5,               // Thicker border when highlighted
      opacity: 1,
      color: '#666',
      fillOpacity: 0.7         // Higher opacity for the highlighted state
    };
  }

  // Function to highlight a feature on mouseover
  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);  // Update info control
  }

  // Function to reset the highlight style
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();  // Reset info control
  }

  // Function to zoom to the selected state
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  // Function to add listeners to each feature
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  // Create info control to display state information
  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // Create a div with class "info"
    this.update();
    return this._div;
  };

  // Update the control based on feature properties
  info.update = function (props) {
    if (props) {
        // Find the matching row in the table
        const rows = document.querySelectorAll('.states-table tbody tr');
        let capital = "Unknown"; // Default in case a match is not found

        rows.forEach(row => {
            const stateName = row.querySelector('td:first-child').innerText; // Get the state name from the first <td>
            const capitalName = row.querySelector('td:last-child').innerText; // Get the capital name from the second <td>
            
            if (stateName.trim() === props.ST_NM.trim()) { // Match the state's name
                capital = capitalName; // Update the capital if a match is found
            }
        });

        // Update the info control with the state name and its corresponding capital
        this._div.innerHTML = '<h4>States of INDIA</h4>' +
                              '<b>' + props.ST_NM + '</b><br />' +
                              'Capital: ' + capital;
    } else {
        // Default message when no state is hovered
        this._div.innerHTML = '<h4>States of INDIA</h4>Hover over a state';
    }
};


  info.addTo(map);

  //var stateLayers = {}; // Object to store each state's layer
  //var currentLayer = null; // To track the currently visible state layer
  
  // Fetch the GeoJSON file containing state boundaries
  fetch('states.geojson')
    .then(response => response.json())
    .then(data => {
      // Add all states with low opacity for background
      L.geoJSON(data, {
        style: backgroundStyle
      }).addTo(map);
  
      // Store state layers and assign listeners
      geojson = L.geoJSON(data, {
        style: backgroundStyle, // Low opacity for background
        onEachFeature: onEachFeature // Apply event listeners
      }).addTo(map);
  
      // Get all table rows
      const rows = document.querySelectorAll('.states-table tbody tr');
  
      // Add click event to each row
      rows.forEach(row => {
        row.addEventListener('click', function () {
          const stateName = this.querySelector('td').innerText.trim(); // Get state name from the first <td>
  
          if (stateLayers[stateName]) {
            // Remove the currently visible state layer from the map
            if (currentLayer) {
              map.removeLayer(currentLayer);
            }
  
            // Get the new selected state's layer
            currentLayer = stateLayers[stateName];
  
            // Add the selected state's layer with highlight styling
            currentLayer = L.geoJSON(currentLayer.toGeoJSON(), {
              style: highlightStyle // Apply highlight style
            }).addTo(map);

             // Bind the popup with the state name and open it
          currentLayer.bindPopup(stateName).openPopup();
  
            // Zoom to the state's polygon bounds
            map.fitBounds(currentLayer.getBounds());
          } else {
            console.log('State not found on the map:', stateName);
          }
        });
      });
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));
  
  // Define the onEachFeature function to store state layers
  function onEachFeature(feature, layer) {
    const stateName = feature.properties.ST_NM; // Assuming state name is stored in 'ST_NM'
    
    // Store the layer in stateLayers object, using state name as key
    stateLayers[stateName.trim()] = layer;
    
    // Optionally, add hover effects or other interactions for each state
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }
  


