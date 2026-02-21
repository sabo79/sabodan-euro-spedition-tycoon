export enum CargoType {
  GENERAL = 'Allgemeine Fracht',
  REFRIGERATED = 'Kühlware',
  LIQUID = 'Flüssigkeit',
  CHEMICALS = 'Chemikalien', // New
  HEAVY = 'Schwerlast',
  MACHINERY = 'Baumaschinen', // New
  ELECTRONICS = 'Elektronik',
  DANGEROUS = 'Gefahrgut',
  EXPRESS = 'Express-Pakete',
  MAIL = 'Post & Briefe',
  FURNITURE = 'Möbel',
  TOOLS = 'Werkzeug & Teile',
  BULK = 'Schüttgut (Sand/Kies)', // New
  LOGS = 'Baumstämme', // New
  VEHICLES = 'Fahrzeuge', // New
  LIVESTOCK = 'Lebendvieh' // New
}

export enum TruckType {
  CAR = 'PKW',
  SMALL = 'Transporter',
  TRACTOR = 'Sattelzugmaschine',
  HEAVY_DUTY = 'Schwerlast-LKW',
  ELECTRIC = 'E-LKW'
}

export enum TrailerType {
  BOX = 'Koffer/Plane',
  REFRIGERATED = 'Kühlkoffer',
  TANKER = 'Tankauflieger',
  FLATBED = 'Pritsche/Offen',
  LOWBOY = 'Tieflader',
  TIPPER = 'Muldenkipper',
  LOGGER = 'Holztransporter',
  CAR_CARRIER = 'Autotransporter',
  LIVESTOCK = 'Viehtransporter'
}

export enum TruckCondition {
  NEW = 'Neu',
  USED_GOOD = 'Gebraucht (Gut)',
  USED_BAD = 'Gebraucht (Schlecht)'
}

export interface City {
  id: string;
  name: string;
  x: number; // Normalized 0-1000 for map
  y: number; // Normalized 0-1000 for map
  isHub: boolean;
  country: string;
}

export interface TruckModel {
  id: string;
  name: string;
  type: TruckType;
  priceNew: number;
  fuelConsumption: number; // Liters or kWh per 100km
  speed: number; // km/h factor (base 1.0)
  reliability: number; // 0-1 probability of breakdown
  isElectric: boolean;
  enginePower: number; // HP
  capacity: number; // in Tons (Body capacity)
  imageUrl: string; 
}

export interface ShopTrailer {
  id: string;
  name: string;
  price: number;
  capacity: number; // Tons
  weightClass: 'LIGHT' | 'HEAVY'; // Light < 750kg, Heavy up to 3.5t or Semis
  type: TrailerType;
}

export interface Truck {
  id: string;
  modelId: string;
  mileage: number;
  condition: number; // 0-100%
  status: 'IDLE' | 'MOVING' | 'MAINTENANCE' | 'BROKEN';
  locationId: string;
  destinationId?: string;
  currentFuel: number;
  maxFuel: number;
  assignedTrailerId?: string; // For PKW trailers
  currentJobId?: string;
  driverId?: string;
  boughtPrice: number;
  value: number;
}

export interface Trailer {
  id: string;
  modelId: string; // Link to ShopTrailer
  condition: number;
  locationId: string;
  isAttachedTo?: string; // Truck ID
  value: number; // Current value
}

export interface Driver {
  id: string;
  name: string;
  salary: number;
  skill: number; // 0-10, affects fuel and speed
  status: 'IDLE' | 'DRIVING' | 'RESTING';
  assignedTruckId?: string;
  firingDate?: number; // Day the driver leaves
}

export interface Job {
  id: string;
  sourceCityId: string;
  targetCityId: string;
  cargoType: CargoType;
  weight: number;
  payout: number;
  distance: number;
  expiresInDays: number;
  isUrgent: boolean;
}

export interface PlayerCompany {
  name: string;
  money: number;
  loan: number;
  interestRate: number; // Annual interest rate (e.g., 0.05 for 5%)
  hqCityId: string;
  ownedGarages: string[]; // List of City IDs
  garageLevel: number; // 1-5
  reputation: number;
}

export interface GameEvent {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  date: number;
}

export interface HighScore {
  companyName: string;
  netWorth: number;
  date: string;
}

export interface UserProfile {
  username: string;
  role: 'USER' | 'ADMIN';
  isLocked: boolean;
  created: string;
  lastLogin: string;
  avatar?: string; // Icon name
}