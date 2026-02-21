import { City, Truck, Job, CargoType } from '../types';
import { CITIES as ALL_CITIES } from '../constants';

export const calculateDistance = (cityA: City, cityB: City): number => {
  const dx = cityA.x - cityB.x;
  const dy = cityA.y - cityB.y;
  // Scaling factor: map is 1000x1000 units. Assume Europe width approx 4000km. 
  // 1 unit = 4 km.
  // Multiplied by 1.3 to simulate real road curvature instead of straight line.
  return Math.sqrt(dx * dx + dy * dy) * 4 * 1.3;
};

export const generateJobs = (cities: City[], currentDay: number, priorityLocationIds: string[] = []): Job[] => {
  const jobs: Job[] = [];
  
  // 1. Guaranteed jobs for player locations (20 per location)
  const uniquePriorityIds = [...new Set(priorityLocationIds)];
  
  uniquePriorityIds.forEach(locId => {
      const source = cities.find(c => c.id === locId);
      if (!source) return;

      for (let i = 0; i < 20; i++) {
          jobs.push(createSingleJob(source, cities, currentDay, i, true));
      }
  });

  // 2. Random filler jobs to make the world alive (up to 1000 total)
  const remainingSlots = 1000 - jobs.length;
  for (let i = 0; i < remainingSlots; i++) {
    const source = cities[Math.floor(Math.random() * cities.length)];
    jobs.push(createSingleJob(source, cities, currentDay, i + 9999, false));
  }

  return jobs;
};

const createSingleJob = (source: City, allCities: City[], day: number, index: number, isPriority: boolean): Job => {
    let target = allCities[Math.floor(Math.random() * allCities.length)];
    while (target.id === source.id) {
      target = allCities[Math.floor(Math.random() * allCities.length)];
    }

    const dist = calculateDistance(source, target);
    
    // Determine if this is a Light job (for Sprinters/Cars) or Heavy job
    const isLightJob = Math.random() < 0.35; // 35% jobs are small
    
    let cType: CargoType;
    let basePay: number; // Euro per km per ton approx
    let weight: number;

    if (isLightJob) {
        // Light Cargo (< 3.5t)
        const lightTypes = [CargoType.EXPRESS, CargoType.MAIL, CargoType.TOOLS, CargoType.FURNITURE, CargoType.ELECTRONICS, CargoType.GENERAL];
        cType = lightTypes[Math.floor(Math.random() * lightTypes.length)];
        
        weight = 0.1 + Math.random() * 3.4; // 100kg to 3.5t
        
        // Higher pay per ton for express/fragile
        basePay = 5.0 + Math.random() * 3.0; 
    } else {
        // Heavy Cargo (> 4t)
        const rand = Math.random();
        // Updated Probability distribution for new cargo types
        if (rand > 0.90) cType = CargoType.HEAVY;
        else if (rand > 0.85) cType = CargoType.MACHINERY;
        else if (rand > 0.80) cType = CargoType.DANGEROUS;
        else if (rand > 0.75) cType = CargoType.CHEMICALS;
        else if (rand > 0.70) cType = CargoType.LIQUID;
        else if (rand > 0.65) cType = CargoType.REFRIGERATED;
        else if (rand > 0.60) cType = CargoType.VEHICLES;
        else if (rand > 0.55) cType = CargoType.LOGS;
        else if (rand > 0.50) cType = CargoType.BULK;
        else if (rand > 0.45) cType = CargoType.LIVESTOCK;
        else cType = CargoType.GENERAL;

        weight = 4 + Math.floor(Math.random() * 26); // 4t to 30t

        basePay = 2.0;
        if (cType === CargoType.REFRIGERATED) basePay = 2.5;
        if (cType === CargoType.DANGEROUS || cType === CargoType.CHEMICALS) basePay = 4.5;
        if (cType === CargoType.HEAVY || cType === CargoType.MACHINERY) basePay = 5.0;
        if (cType === CargoType.LIQUID) basePay = 3.0;
        if (cType === CargoType.VEHICLES) basePay = 4.0;
    }

    const isUrgent = Math.random() > 0.9;
    if (isUrgent) basePay *= 1.5;

    // Calculate payout
    // Payout logic: Base * Weight * Distance
    // REDUCED TO 1/6th as requested
    let finalPay = (dist * basePay * weight) / 6;
    
    // Minimum charge for small jobs (adjusted lower)
    if (finalPay < 100) finalPay = 100 + Math.random() * 100;

    return {
      id: `job-${day}-${source.id}-${index}`,
      sourceCityId: source.id,
      targetCityId: target.id,
      cargoType: cType,
      weight: parseFloat(weight.toFixed(1)),
      distance: Math.floor(dist),
      payout: Math.floor(finalPay),
      expiresInDays: isUrgent ? 2 : 5 + Math.floor(Math.random() * 5),
      isUrgent
    };
}

export const getCityById = (id: string): City | undefined => {
  return ALL_CITIES.find(c => c.id === id);
};