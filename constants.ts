import { TruckModel, TruckType, CargoType, City, ShopTrailer, TrailerType } from './types';

export const APP_VERSION = "1.0.0-beta";
export const BUILD_DATE = new Date().toLocaleDateString('de-DE'); // Setzt das aktuelle Datum
export const STARTING_CAPITAL = 100000; // Stammkapital
export const LOAN_INTEREST_RATE = 0.05; // Fallback, now dynamic per loan
export const FUEL_PRICE_DIESEL = 1.65;
export const FUEL_PRICE_ELEC = 0.45; // per kWh equiv
export const REPAIR_COST_BASE = 1000;

export const LOAN_OFFERS = [
  { id: 'loan_small', name: 'Start-Up Hilfe', amount: 100000, rate: 0.03, description: 'Geringes Risiko, ideal für den Anfang.' },
  { id: 'loan_medium', name: 'Investitionskredit', amount: 250000, rate: 0.05, description: 'Standardfinanzierung für Wachstum.' },
  { id: 'loan_large', name: 'Großkredit', amount: 500000, rate: 0.08, description: 'Viel Kapital, aber hohe Zinslast.' },
  { id: 'loan_none', name: 'Eigenfinanziert', amount: 0, rate: 0.0, description: 'Nur Stammkapital. Hardcore Modus.' }
];

// Compatibility Logic: Which trailer accepts which cargo?
export const TRAILER_COMPATIBILITY: Record<TrailerType, CargoType[]> = {
    [TrailerType.BOX]: [CargoType.GENERAL, CargoType.EXPRESS, CargoType.MAIL, CargoType.FURNITURE, CargoType.TOOLS, CargoType.ELECTRONICS],
    [TrailerType.REFRIGERATED]: [CargoType.REFRIGERATED, CargoType.GENERAL, CargoType.EXPRESS], // Can also carry general
    [TrailerType.TANKER]: [CargoType.LIQUID, CargoType.CHEMICALS, CargoType.DANGEROUS],
    [TrailerType.FLATBED]: [CargoType.HEAVY, CargoType.MACHINERY, CargoType.GENERAL, CargoType.LOGS, CargoType.VEHICLES],
    [TrailerType.LOWBOY]: [CargoType.HEAVY, CargoType.MACHINERY, CargoType.VEHICLES],
    [TrailerType.TIPPER]: [CargoType.BULK],
    [TrailerType.LOGGER]: [CargoType.LOGS],
    [TrailerType.CAR_CARRIER]: [CargoType.VEHICLES],
    [TrailerType.LIVESTOCK]: [CargoType.LIVESTOCK]
};

// Generate Cities Procedurally to reach 500+
const HUBS = [
  // Western Europe / Central
  { name: 'Berlin', x: 550, y: 350, country: 'DE' },
  { name: 'Hamburg', x: 520, y: 280, country: 'DE' },
  { name: 'München', x: 560, y: 480, country: 'DE' },
  { name: 'Frankfurt', x: 500, y: 400, country: 'DE' },
  { name: 'Köln', x: 450, y: 380, country: 'DE' },
  { name: 'Stuttgart', x: 490, y: 450, country: 'DE' },
  { name: 'Leipzig', x: 560, y: 380, country: 'DE' },
  { name: 'Nürnberg', x: 540, y: 430, country: 'DE' },
  
  { name: 'Paris', x: 350, y: 450, country: 'FR' },
  { name: 'Lyon', x: 380, y: 550, country: 'FR' },
  { name: 'Marseille', x: 400, y: 650, country: 'FR' },
  { name: 'Bordeaux', x: 280, y: 580, country: 'FR' },
  { name: 'Strasbourg', x: 430, y: 440, country: 'FR' },
  { name: 'Lille', x: 370, y: 360, country: 'FR' },

  { name: 'London', x: 320, y: 320, country: 'UK' },
  { name: 'Manchester', x: 300, y: 280, country: 'UK' },
  { name: 'Birmingham', x: 290, y: 300, country: 'UK' },
  { name: 'Glasgow', x: 280, y: 220, country: 'UK' },
  { name: 'Dublin', x: 220, y: 280, country: 'IE' },

  { name: 'Madrid', x: 200, y: 700, country: 'ES' },
  { name: 'Barcelona', x: 350, y: 750, country: 'ES' },
  { name: 'Valencia', x: 280, y: 750, country: 'ES' },
  { name: 'Sevilla', x: 180, y: 800, country: 'ES' },
  { name: 'Bilbao', x: 220, y: 650, country: 'ES' },
  { name: 'Lissabon', x: 100, y: 720, country: 'PT' },
  { name: 'Porto', x: 100, y: 680, country: 'PT' },

  { name: 'Rom', x: 580, y: 720, country: 'IT' },
  { name: 'Mailand', x: 500, y: 600, country: 'IT' },
  { name: 'Turin', x: 460, y: 600, country: 'IT' },
  { name: 'Venedig', x: 550, y: 620, country: 'IT' },
  { name: 'Neapel', x: 600, y: 780, country: 'IT' },

  // Benelux & Alps
  { name: 'Amsterdam', x: 400, y: 330, country: 'NL' },
  { name: 'Rotterdam', x: 390, y: 340, country: 'NL' },
  { name: 'Brüssel', x: 380, y: 360, country: 'BE' },
  { name: 'Antwerpen', x: 385, y: 350, country: 'BE' },
  { name: 'Zürich', x: 480, y: 520, country: 'CH' },
  { name: 'Wien', x: 620, y: 500, country: 'AT' },
  { name: 'Salzburg', x: 580, y: 510, country: 'AT' },

  // East / North
  { name: 'Warschau', x: 700, y: 350, country: 'PL' },
  { name: 'Krakau', x: 700, y: 400, country: 'PL' },
  { name: 'Danzig', x: 680, y: 280, country: 'PL' },
  { name: 'Posen', x: 650, y: 350, country: 'PL' },
  { name: 'Prag', x: 600, y: 420, country: 'CZ' },
  { name: 'Budapest', x: 680, y: 550, country: 'HU' },
  
  { name: 'Kopenhagen', x: 530, y: 200, country: 'DK' },
  { name: 'Stockholm', x: 650, y: 150, country: 'SE' },
  { name: 'Göteborg', x: 580, y: 180, country: 'SE' },
  { name: 'Oslo', x: 500, y: 100, country: 'NO' },
  { name: 'Helsinki', x: 700, y: 120, country: 'FI' },
  { name: 'Riga', x: 750, y: 250, country: 'LV' },
  { name: 'Vilnius', x: 780, y: 300, country: 'LT' },
  { name: 'Tallinn', x: 750, y: 180, country: 'EE' },

  // South East
  { name: 'Athen', x: 800, y: 850, country: 'GR' },
  { name: 'Thessaloniki', x: 780, y: 800, country: 'GR' },
  { name: 'Istanbul', x: 900, y: 800, country: 'TR' },
  { name: 'Bukarest', x: 820, y: 580, country: 'RO' },
  { name: 'Sofia', x: 800, y: 650, country: 'BG' },
  { name: 'Belgrad', x: 750, y: 600, country: 'RS' },
  { name: 'Zagreb', x: 660, y: 580, country: 'HR' }
];

export const CITIES: City[] = [];

// Populate hubs
HUBS.forEach((hub, index) => {
  CITIES.push({
    id: `hub-${index}`,
    name: hub.name,
    x: hub.x,
    y: hub.y,
    isHub: true,
    country: hub.country
  });

  // Generate satellites
  const satellites = 15; // Slightly reduced satellites per hub since we have more hubs
  for (let i = 0; i < satellites; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 40; // distance from hub
    CITIES.push({
      id: `city-${hub.name}-${i}`,
      name: `${hub.name} Gebiet ${i + 1}`, // Simplified naming
      x: Math.max(0, Math.min(1000, hub.x + Math.cos(angle) * dist)),
      y: Math.max(0, Math.min(1000, hub.y + Math.sin(angle) * dist)),
      isHub: false,
      country: hub.country
    });
  }
});

const SUFFIXES = ['Nord', 'Süd', 'Hafen', 'Industrie', 'Logistikpark', 'Vorstadt', 'Zentrum', 'West', 'Ost', 'Gewerbegebiet', 'Airport', 'Messe'];
CITIES.forEach(c => {
  if (!c.isHub) {
    const parts = c.name.split(' ');
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    c.name = `${parts[0]} ${suffix}`;
  }
});

// Sort Cities Alphabetically
CITIES.sort((a, b) => a.name.localeCompare(b.name));

// Expanded Truck Models with Fictional Names - Adjusted speeds (km/h)
export const TRUCK_MODELS: TruckModel[] = [
  // PKW & SUV (Small Trailers) - Speed 100 km/h
  // NOTE: Capacities reduced to "Trunk only" sizes. Requires trailer for more.
  {
    id: 'car_combi',
    name: 'Family Combi Diesel',
    type: TruckType.CAR,
    priceNew: 45000,
    fuelConsumption: 7,
    speed: 100,
    reliability: 0.96,
    isElectric: false,
    enginePower: 150,
    capacity: 0.4, // Kofferraum
    imageUrl: ''
  },
  {
    id: 'car_suv',
    name: 'Allroad SUV V6',
    type: TruckType.CAR,
    priceNew: 75000,
    fuelConsumption: 12,
    speed: 100,
    reliability: 0.95,
    isElectric: false,
    enginePower: 280,
    capacity: 0.6, // Kofferraum
    imageUrl: ''
  },
  {
    id: 'car_pickup',
    name: 'Ranger Pick-Up 4x4',
    type: TruckType.CAR,
    priceNew: 60000,
    fuelConsumption: 11,
    speed: 100,
    reliability: 0.93,
    isElectric: false,
    enginePower: 240,
    capacity: 0.9, // Ladefläche
    imageUrl: ''
  },

  // SMALL VANS (Sprinter Class) - Speed 120 km/h
  {
    id: 'van_basic',
    name: 'City Van 3.0t',
    type: TruckType.SMALL,
    priceNew: 35000,
    fuelConsumption: 9,
    speed: 120,
    reliability: 0.94,
    isElectric: false,
    enginePower: 140,
    capacity: 1.2,
    imageUrl: ''
  },
  {
    id: 'van_pro',
    name: 'Express Maxi 3.5t',
    type: TruckType.SMALL,
    priceNew: 48000,
    fuelConsumption: 11,
    speed: 120,
    reliability: 0.96,
    isElectric: false,
    enginePower: 190,
    capacity: 1.5,
    imageUrl: ''
  },
  {
    id: 'van_box',
    name: 'Cargo Box 5.0t',
    type: TruckType.SMALL,
    priceNew: 55000,
    fuelConsumption: 14,
    speed: 110, // slightly slower due to box aerodynamics
    reliability: 0.95,
    isElectric: false,
    enginePower: 180,
    capacity: 2.5,
    imageUrl: ''
  },
  
  // TRACTORS (Standard) - Speed 85 km/h
  {
    id: 'daf_xf_480',
    name: 'Dutch X-Series 480',
    type: TruckType.TRACTOR,
    priceNew: 105000,
    fuelConsumption: 28,
    speed: 85,
    reliability: 0.95,
    isElectric: false,
    enginePower: 480,
    capacity: 0, // Tractors have 0 capacity without trailer
    imageUrl: ''
  },
  {
    id: 'iveco_sway',
    name: 'Torino S-Class 510',
    type: TruckType.TRACTOR,
    priceNew: 108000,
    fuelConsumption: 29,
    speed: 85,
    reliability: 0.93,
    isElectric: false,
    enginePower: 510,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'renault_t',
    name: 'Gaul T-Range 520',
    type: TruckType.TRACTOR,
    priceNew: 112000,
    fuelConsumption: 28.5,
    speed: 85,
    reliability: 0.94,
    isElectric: false,
    enginePower: 520,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'man_tgx',
    name: 'Bavaria TG-X 500',
    type: TruckType.TRACTOR,
    priceNew: 125000,
    fuelConsumption: 27,
    speed: 85,
    reliability: 0.97,
    isElectric: false,
    enginePower: 500,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'actros_1851',
    name: 'Stellar Prime 1851',
    type: TruckType.TRACTOR,
    priceNew: 135000,
    fuelConsumption: 26,
    speed: 85,
    reliability: 0.98,
    isElectric: false,
    enginePower: 510,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'scania_r500',
    name: 'Griffin R-Series 500',
    type: TruckType.TRACTOR,
    priceNew: 145000,
    fuelConsumption: 25,
    speed: 85,
    reliability: 0.99,
    isElectric: false,
    enginePower: 500,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'volvo_fh_540',
    name: 'Viking FH 540',
    type: TruckType.TRACTOR,
    priceNew: 148000,
    fuelConsumption: 24.5,
    speed: 85,
    reliability: 0.99,
    isElectric: false,
    enginePower: 540,
    capacity: 0,
    imageUrl: ''
  },

  // HEAVY DUTY - Speed 85 km/h
  {
    id: 'scania_v8_770',
    name: 'Griffin King V8',
    type: TruckType.HEAVY_DUTY,
    priceNew: 210000,
    fuelConsumption: 35,
    speed: 85,
    reliability: 0.99,
    isElectric: false,
    enginePower: 770,
    capacity: 0, 
    imageUrl: ''
  },
  {
    id: 'volvo_fh16_750',
    name: 'Viking 16-Liter 750',
    type: TruckType.HEAVY_DUTY,
    priceNew: 205000,
    fuelConsumption: 36,
    speed: 85,
    reliability: 0.98,
    isElectric: false,
    enginePower: 750,
    capacity: 0,
    imageUrl: ''
  },

  // ELECTRIC - Speed 85 km/h (Truck), 100 km/h (Light)
  {
    id: 'etruck_city',
    name: 'Stellar E-Charged 300',
    type: TruckType.ELECTRIC,
    priceNew: 190000,
    fuelConsumption: 100, 
    speed: 85,
    reliability: 0.95,
    isElectric: true,
    enginePower: 400,
    capacity: 0,
    imageUrl: ''
  },
  {
    id: 'tesla_semi',
    name: 'Cyber Hauler Long Range',
    type: TruckType.ELECTRIC,
    priceNew: 250000,
    fuelConsumption: 120, 
    speed: 90,
    reliability: 0.92,
    isElectric: true,
    enginePower: 1020,
    capacity: 0,
    imageUrl: ''
  }
];

export const SHOP_TRAILERS: ShopTrailer[] = [
    // Light Trailers (Car/Van)
    { id: 'trailer_utility', name: 'Leichtanhänger 750kg', price: 1500, capacity: 0.75, weightClass: 'LIGHT', type: TrailerType.BOX },
    { id: 'trailer_box_small', name: 'Kofferanhänger 1.5t', price: 3500, capacity: 1.5, weightClass: 'LIGHT', type: TrailerType.BOX },
    { id: 'trailer_flatbed', name: 'Pritschenanhänger 2.0t', price: 4200, capacity: 2.0, weightClass: 'LIGHT', type: TrailerType.FLATBED },
    { id: 'trailer_car_trans', name: 'Autotransporter 2.5t', price: 5500, capacity: 2.5, weightClass: 'LIGHT', type: TrailerType.CAR_CARRIER },
    { id: 'trailer_horse', name: 'Pferdeanhänger 2.0t', price: 6000, capacity: 2.0, weightClass: 'LIGHT', type: TrailerType.LIVESTOCK },
    { id: 'trailer_large_box', name: 'Maxi Koffer 3.5t', price: 7500, capacity: 3.5, weightClass: 'LIGHT', type: TrailerType.BOX },

    // Heavy Trailers (Semis)
    { id: 'semi_curtain', name: 'Curtainsider Standard', price: 28000, capacity: 25, weightClass: 'HEAVY', type: TrailerType.BOX },
    { id: 'semi_box', name: 'Trockenkoffer', price: 32000, capacity: 24, weightClass: 'HEAVY', type: TrailerType.BOX },
    { id: 'semi_fridge', name: 'Kühlauflieger (Reefer)', price: 55000, capacity: 23, weightClass: 'HEAVY', type: TrailerType.REFRIGERATED },
    { id: 'semi_tanker_food', name: 'Lebensmitteltank', price: 60000, capacity: 28, weightClass: 'HEAVY', type: TrailerType.TANKER },
    { id: 'semi_tanker_chem', name: 'Chemie/ADR Tanker', price: 85000, capacity: 26, weightClass: 'HEAVY', type: TrailerType.TANKER },
    { id: 'semi_tipper_steel', name: 'Stahl-Muldenkipper', price: 42000, capacity: 28, weightClass: 'HEAVY', type: TrailerType.TIPPER },
    { id: 'semi_logger', name: 'Holztransporter', price: 38000, capacity: 30, weightClass: 'HEAVY', type: TrailerType.LOGGER },
    { id: 'semi_lowboy', name: 'Tieflader (3-Achs)', price: 65000, capacity: 35, weightClass: 'HEAVY', type: TrailerType.LOWBOY },
    { id: 'semi_flatbed', name: 'Pritschenauflieger', price: 30000, capacity: 26, weightClass: 'HEAVY', type: TrailerType.FLATBED },
    { id: 'semi_car_trans', name: 'PKW-Transporter', price: 70000, capacity: 18, weightClass: 'HEAVY', type: TrailerType.CAR_CARRIER },
    { id: 'semi_livestock', name: 'Viehtransporter', price: 68000, capacity: 22, weightClass: 'HEAVY', type: TrailerType.LIVESTOCK },
];

export const DRIVER_NAMES = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Kowalski', 'Novak', 'Rossi', 'Dupont', 'Smith', 'Ivanov', 'Garcia', 'Andersson', 'Jansen', 'Lefevre', 
  'Dubois', 'Silva', 'Santos', 'Popov', 'Petrov', 'Nielsen', 'Hansen', 'Larsen', 'Gruber', 'Bauer'
];