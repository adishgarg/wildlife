require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/Report');

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://gargadi456:adish@cluster0.3k4jxw0.mongodb.net/?appName=Cluster0";

// Helper: random date within last N months
function randDate(monthsBack) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    return new Date(from.getTime() + Math.random() * (now - from));
}

// Rich sample reports spread across last 6 months
const sampleReports = [
    // Accidents
    { location: "NH-7, Pench Tiger Reserve Gate", latitude: 21.6845, longitude: 79.2890, type: "accident", description: "Deer struck by speeding truck near forest boundary" },
    { location: "NH-4, Bandipur Forest Zone", latitude: 11.6789, longitude: 76.6102, type: "accident", description: "Wild boar collision, vehicle damaged" },
    { location: "SH-17, Corbett Buffer Zone", latitude: 29.5307, longitude: 78.7747, type: "accident", description: "Nilgai hit near milestone 34" },
    { location: "NH-44, Kanha Forest Corridor", latitude: 22.3350, longitude: 80.6115, type: "accident", description: "Night collision with spotted deer herd" },
    { location: "MDR-108, Mudumalai Entry", latitude: 11.5791, longitude: 76.5290, type: "accident", description: "Elephant jaywalking caused 3-vehicle collision" },
    { location: "NH-37, Kaziranga Buffer", latitude: 26.5775, longitude: 93.1719, type: "accident", description: "Rhino calf spotted injured on roadside" },
    { location: "NH-766, Wayanad Wildlife Corridor", latitude: 11.8745, longitude: 76.0815, type: "accident", description: "Vehicle-tiger collision reported near Tholpetty" },
    { location: "SH-33, Ranthambore Zone 3", latitude: 26.0173, longitude: 76.5026, type: "accident", description: "Sambhar deer found injured by roadside" },

    // Injured
    { location: "Bandipur National Park, Zone C", latitude: 11.6603, longitude: 76.6260, type: "injured", description: "Young leopard with leg injury, vet team dispatched" },
    { location: "Kaziranga, NH-37 Km 243", latitude: 26.5800, longitude: 93.1500, type: "injured", description: "Hog deer found with snare wound" },
    { location: "Corbett, Dhikuli Range", latitude: 29.5601, longitude: 78.8102, type: "injured", description: "Injured elephant calf separated from herd" },
    { location: "Tadoba, Gate No. 2", latitude: 20.2148, longitude: 79.3900, type: "injured", description: "Sloth bear found with road rash injuries" },

    // Poaching
    { location: "Panna Tiger Reserve, Zone A", latitude: 24.7200, longitude: 80.1100, type: "poaching", description: "Steel traps found near watering hole" },
    { location: "Sundarbans Buffer Zone", latitude: 21.9497, longitude: 88.8800, type: "poaching", description: "Fishing nets with wildlife bycatch reported" },
    { location: "Sariska Reserve, Northern Edge", latitude: 27.3350, longitude: 76.3000, type: "poaching", description: "Suspicious camp with animal bones found" },
    { location: "Bharatpur, Keoladeo Wetland", latitude: 27.1750, longitude: 77.5200, type: "poaching", description: "Bird trapping activity detected near Zone B" },

    // Movement / Safe crossings
    { location: "Mudumalai-Bandipur Corridor, NH-766", latitude: 11.5910, longitude: 76.5800, type: "movement", description: "Herd of 12 elephants safely crossing near underpass" },
    { location: "Nagarhole, Kabini Bridge", latitude: 11.9782, longitude: 76.3461, type: "movement", description: "Gaur herd sighted moving through wildlife corridor" },
    { location: "Jim Corbett, Ramganga River Zone", latitude: 29.5200, longitude: 78.7900, type: "movement", description: "Tiger with two cubs spotted crossing safely" },
    { location: "Bandipur Underpass, NH-212", latitude: 11.6900, longitude: 76.6500, type: "movement", description: "Elephant corridor underpass successfully used by herd" },
    { location: "Kanha-Pench Link Forest", latitude: 22.1700, longitude: 80.0200, type: "movement", description: "Leopard camera-trapped using wildlife overpass" },
    { location: "Ranthambore, Zone 5 Waterhole", latitude: 26.0300, longitude: 76.5100, type: "movement", description: "Tiger family spotted at dawn, no conflict" },
    { location: "Sundarbans, Boat Patrol Zone", latitude: 22.0100, longitude: 88.9100, type: "movement", description: "Royal Bengal Tiger observed swimming between islands" },
    { location: "Namdapha, Forest Path 3", latitude: 27.5200, longitude: 96.3800, type: "movement", description: "Snow leopard captured on camera trap crossing ridge" },
];

// Spread dates randomly over last 6 months
const reportsWithDates = sampleReports.map((r, i) => ({
    ...r,
    createdAt: randDate(Math.floor(i / 4) + 1) // spread evenly across months
}));

async function seed() {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Remove old seed data (keep real user reports by checking for description content)
    const inserted = await Report.insertMany(reportsWithDates);
    console.log(`✅ Inserted ${inserted.length} sample reports`);

    mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
