import fs from 'fs';
import DottedMap from 'dotted-map';
import proj4 from 'proj4';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

async function generate() {
  console.log('Fetching India boundary...');
  const rInd = await fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson');
  const dInd = await rInd.json();
  const indiaFeature = dInd.features[0];

  console.log('Initializing DottedMap...');
  const map = new DottedMap({ height: 100, grid: 'diagonal' });
  const points = map.getPoints();
  const { X_MIN, Y_MAX, X_RANGE, Y_RANGE, width, height, proj4String } = map;

  const SCALE = 6;
  const SVG_WIDTH = width * SCALE;
  const SVG_HEIGHT = height * SCALE;

  let indiaDots = [];
  let worldDots = [];

  for (const pt of points) {
    const wgs84 = proj4(proj4String, 'WGS84', [
      (pt.x / width) * X_RANGE + X_MIN,
      Y_MAX - (pt.y / height) * Y_RANGE
    ]);
    const lng = wgs84[0];
    const lat = wgs84[1];
    const sx = Math.round(pt.x * SCALE * 10) / 10;
    const sy = Math.round(pt.y * SCALE * 10) / 10;

    if (lng >= 68 && lng <= 98 && lat >= 6 && lat <= 38) {
      if (booleanPointInPolygon([lng, lat], indiaFeature)) {
        indiaDots.push({ x: sx, y: sy });
        continue;
      }
    }
    worldDots.push({ x: sx, y: sy });
  }

  // Create single optimized SVG path for world dots (radius 1.15)
  const rWorld = 1.15;
  const worldPathD = worldDots.map(pt => {
    const x0 = Math.round((pt.x - rWorld) * 10) / 10;
    const y0 = pt.y;
    return `M${x0},${y0}a${rWorld},${rWorld} 0 1,0 ${2 * rWorld},0a${rWorld},${rWorld} 0 1,0 -${2 * rWorld},0Z`;
  }).join('');

  // Vijayawada origin
  const vPin = map.getPin({ lat: 16.5062, lng: 80.6480 });
  const origin = {
    id: 'vijayawada',
    name: 'VIJAYAWADA',
    lat: 16.5062,
    lng: 80.6480,
    x: Math.round(vPin.x * SCALE * 10) / 10,
    y: Math.round(vPin.y * SCALE * 10) / 10
  };

  const destinations = [
    { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, labelPos: 'top-left' },
    { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lng: 77.5946, labelPos: 'bottom-left' },
    { id: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707, labelPos: 'bottom-right' },
    { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777, labelPos: 'left' },
    { id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, labelPos: 'top-right' },
    { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lng: 88.3639, labelPos: 'right' },
    { id: 'ahmedabad', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, labelPos: 'left' },
    { id: 'kochi', name: 'Kochi', lat: 9.9312, lng: 76.2673, labelPos: 'bottom' }
  ].map((d, idx) => {
    const pin = map.getPin({ lat: d.lat, lng: d.lng });
    return {
      ...d,
      x: Math.round(pin.x * SCALE * 10) / 10,
      y: Math.round(pin.y * SCALE * 10) / 10,
      delay: 1.8 + idx * 0.12
    };
  });

  const content = `export const MAP_CONFIG = {
  viewBox: "0 0 ${SVG_WIDTH} ${SVG_HEIGHT}",
  width: ${SVG_WIDTH},
  height: ${SVG_HEIGHT},
  dotRadiusWorld: ${rWorld},
  dotRadiusIndia: 1.85,
};

export interface MapDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  labelPos: string;
  delay: number;
}

export const ORIGIN_CITY = ${JSON.stringify(origin, null, 2)};

export const DESTINATIONS: MapDestination[] = ${JSON.stringify(destinations, null, 2)};

export const INDIA_DOTS: Array<{ x: number; y: number }> = ${JSON.stringify(indiaDots)};

export const WORLD_DOTS_PATH: string = ${JSON.stringify(worldPathD)};
`;

  fs.writeFileSync('src/components/network/dottedMapData.ts', content, 'utf-8');
  console.log('Successfully wrote src/components/network/dottedMapData.ts!');
}

generate();
