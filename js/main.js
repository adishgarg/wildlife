document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Map (Leaflet)
    // Coords approximately near a forest area in India (e.g., Bandipur/Mudumalai region)
    const map = L.map('map').setView([11.6603, 76.6260], 10);

    // Use CartoDB Dark Matter for dark theme map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Custom Icons
    const accidentIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--accent); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--accent);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const animalIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #F2CC8F; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #F2CC8F;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    // Fetch and display existing reports from MongoDB
    async function loadReports() {
        try {
            const res = await fetch('http://localhost:3000/api/reports');
            if (res.ok) {
                const dbIncidents = await res.json();
                dbIncidents.forEach(inc => {
                    const isUrgent = (inc.type === 'accident' || inc.type === 'poaching' || inc.type === 'injured');
                    const icon = isUrgent ? accidentIcon : animalIcon;
                    const title = isUrgent ? '🚨 Accident' : '🐘 Wildlife';
                    const desc = inc.description || inc.location;
                    L.marker([inc.latitude, inc.longitude], { icon: icon })
                        .addTo(map)
                        .bindPopup(`<b>${title}</b><br>${desc} (${inc.type})`);
                });
            }
        } catch (err) {
            console.error("Could not fetch reports from backend:", err);
        }
    }
    
    loadReports();

    // Mock Data Points
    const incidents = [
        { lat: 11.6603, lng: 76.6260, type: 'accident', desc: 'Vehicle collision with deer' },
        { lat: 11.7001, lng: 76.6800, type: 'accident', desc: 'Minor accident, roadkill reported' },
        { lat: 11.6205, lng: 76.5810, type: 'animal', desc: 'Elephant herd crossing' },
        { lat: 11.6500, lng: 76.7000, type: 'animal', desc: 'Leopard sighting near highway' }
    ];

    incidents.forEach(inc => {
        const icon = inc.type === 'accident' ? accidentIcon : animalIcon;
        L.marker([inc.lat, inc.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${inc.type === 'accident' ? '🚨 Accident' : '🐘 Wildlife'}</b><br>${inc.desc}`);
    });

    // AI High Risk Zone (Circle)
    const highRiskZone = L.circle([11.6800, 76.6500], {
        color: '#E07A5F',
        fillColor: '#E07A5F',
        fillOpacity: 0.2,
        radius: 4000
    }).addTo(map);
    highRiskZone.bindPopup("<b>AI Prediction</b><br>High-risk zone for night driving based on historical data.");

    // 2. Dashboard Charts (Chart.js)
    Chart.defaults.color = '#ffffff';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // Bar Chart
    const ctxBar = document.getElementById('accidentsChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Reported Incidents',
                data: [12, 19, 8, 15, 22, 18],
                backgroundColor: '#4A827F', /* Teal */
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { grid: { color: 'rgba(135, 159, 130, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Doughnut Chart
    const ctxPie = document.getElementById('animalsChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Elephants', 'Leopards', 'Deer', 'Others'],
            datasets: [{
                data: [15, 10, 50, 25],
                backgroundColor: ['#1a3622', '#DE8F59', '#F2CC8F', '#4A827F'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });

    // 3. Geolocation API Logic
    const locInput = document.getElementById('reportLocation');
    const getLocBtn = document.getElementById('getLocationBtn');

    if (getLocBtn && locInput) {
        getLocBtn.addEventListener('click', () => {
            getLocBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    // Store exact coords for map marker
                    locInput.dataset.lat = lat;
                    locInput.dataset.lng = lng;
                    
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();
                        // Get readable address
                        const address = data.address;
                        locInput.value = address.road ? `${address.road}, ${address.city || address.county || data.display_name.split(',')[0]}` : data.display_name.split(',').slice(0, 2).join(', ');
                    } catch (e) {
                        locInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }
                    getLocBtn.innerHTML = '<i class="fa-solid fa-check text-success"></i>';
                }, (err) => {
                    getLocBtn.innerHTML = '<i class="fa-solid fa-xmark text-danger"></i>';
                    alert("Location access denied or unavailable.");
                });
            } else {
                alert("Geolocation not supported.");
                getLocBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            }
        });
    }

    // Autocomplete for location input
    const suggestionBox = document.getElementById('locationSuggestions');
    let timeoutId;

    if (locInput && suggestionBox) {
        locInput.addEventListener('input', (e) => {
            const query = e.target.value;
            clearTimeout(timeoutId);
            
            if (query.trim().length < 3) {
                suggestionBox.style.display = 'none';
                return;
            }
            
            timeoutId = setTimeout(async () => {
                try {
                    // Restricting to countrycodes=in for relevance to the hero section stats
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=4&countrycodes=in`);
                    const data = await res.json();
                    
                    suggestionBox.innerHTML = '';
                    if (data && data.length > 0) {
                        data.forEach(place => {
                            const li = document.createElement('li');
                            li.className = 'dropdown-item text-wrap border-bottom p-3';
                            li.style.color = 'var(--text-main)';
                            li.style.borderColor = 'var(--glass-border) !important';
                            li.style.cursor = 'pointer';
                            li.style.fontSize = '0.9rem';
                            
                            // Format name nicely
                            const nameParts = place.display_name.split(',');
                            const primary = nameParts.shift();
                            const secondary = nameParts.join(',').trim();
                            
                            li.innerHTML = `<i class="fa-solid fa-map-pin text-sage me-2"></i> <strong>${primary}</strong> <br><small class="text-white text-opacity-75 ms-4" style="font-size: 0.8em;">${secondary}</small>`;
                            
                            // Hover effect
                            li.addEventListener('mouseover', () => li.style.backgroundColor = 'var(--primary-dark)');
                            li.addEventListener('mouseout', () => li.style.backgroundColor = 'transparent');
                            
                            li.addEventListener('click', () => {
                                locInput.value = primary + ', ' + secondary.split(',').slice(0, 1).join('');
                                locInput.dataset.lat = place.lat;
                                locInput.dataset.lng = place.lon;
                                suggestionBox.style.display = 'none';
                            });
                            suggestionBox.appendChild(li);
                        });
                        suggestionBox.style.display = 'block';
                    } else {
                        suggestionBox.style.display = 'none';
                    }
                } catch(err) {
                    console.error("Autocomplete failed: ", err);
                }
            }, 600); // 600ms debounce
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!locInput.contains(e.target) && !suggestionBox.contains(e.target)) {
                suggestionBox.style.display = 'none';
            }
        });
    }

    // 4. Form Submission Handling
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitReport');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;

            setTimeout(async () => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Report Sent';
                btn.classList.remove('btn-accent');
                btn.classList.add('btn-success');
                
                const locVal = locInput.value;
                const typeVal = document.getElementById('reportType').value;
                
                let newLat = locInput.dataset.lat;
                let newLng = locInput.dataset.lng;
                
                // If they typed manually, forward geocode it via Nominatim API
                if (!newLat || !newLng) {
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locVal)}&limit=1`);
                        const data = await res.json();
                        if (data && data.length > 0) {
                            newLat = parseFloat(data[0].lat);
                            newLng = parseFloat(data[0].lon);
                        } else {
                            // Map center fallback if place not found
                            newLat = 11.6603 + (Math.random() - 0.5) * 0.15;
                            newLng = 76.6260 + (Math.random() - 0.5) * 0.15;
                        }
                    } catch(err) {
                        newLat = 11.6603 + (Math.random() - 0.5) * 0.15;
                        newLng = 76.6260 + (Math.random() - 0.5) * 0.15;
                    }
                } else {
                    newLat = parseFloat(newLat);
                    newLng = parseFloat(newLng);
                }
                
                const isUrgent = (typeVal === 'accident' || typeVal === 'poaching' || typeVal === 'injured');
                const newIcon = isUrgent ? accidentIcon : animalIcon;
                
                // Save to MongoDB
                try {
                    await fetch('http://localhost:3000/api/reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            location: locVal,
                            latitude: newLat,
                            longitude: newLng,
                            type: typeVal,
                            description: '' // Optional description
                        })
                    });
                } catch (err) {
                    console.error("Failed to save to backend:", err);
                }
                
                const newMarker = L.marker([newLat, newLng], { icon: newIcon })
                    .addTo(map)
                    .bindPopup(`<b>${isUrgent ? '🚨 New User Alert' : '🐘 New User Report'}</b><br>${locVal} (${typeVal})`);
                
                map.flyTo([newLat, newLng], 13, { animate: true, duration: 1.5 });
                newMarker.openPopup();

                reportForm.reset();
                delete locInput.dataset.lat;
                delete locInput.dataset.lng;
                if(getLocBtn) getLocBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-accent');
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // 4. "Did you know?" Toast logic
    const facts = [
        "Roads dividing national parks lead to thousands of animal casualties yearly.",
        "Elephants use specific corridors to migrate; blocking them causes conflicts.",
        "Over 50% of wildlife accidents happen at night.",
        "Slowing down in designated zones reduces fatal wildlife collisions by 80%."
    ];

    document.getElementById('didYouKnowBtn').addEventListener('click', () => {
        const factText = document.getElementById('factText');
        factText.innerText = facts[Math.floor(Math.random() * facts.length)];

        const toastEl = document.getElementById('factToast');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    });
});
