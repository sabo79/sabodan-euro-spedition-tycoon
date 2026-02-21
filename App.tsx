import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Truck as TruckIcon, Map as MapIcon, ShoppingCart, 
  Users, DollarSign, Calendar, TrendingUp, AlertTriangle, 
  Navigation, CheckCircle, Warehouse, BatteryCharging, 
  Wrench, XCircle, Play, Pause, Save, Trophy, Filter, Fuel, Car, GraduationCap, ArrowUpDown, Hammer, PlusCircle, Building2, Banknote, Sun, Moon, FileText, Shield, HelpCircle, LogOut, User, Lock, Unlock, Trash2, ShieldAlert, Edit, X, UserCheck, UserCog, UserPlus, Smile, Zap, Box, Bus, Link as LinkIcon, Unlink, ZoomIn, ZoomOut, RotateCcw, Move
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

import { 
  Truck, City, Job, PlayerCompany, Driver, Trailer, 
  TruckType, TruckModel, CargoType, GameEvent, TruckCondition, HighScore, UserProfile, ShopTrailer, TrailerType
} from './types';
import { CITIES, TRUCK_MODELS, SHOP_TRAILERS, TRAILER_COMPATIBILITY, DRIVER_NAMES, STARTING_CAPITAL, FUEL_PRICE_DIESEL, FUEL_PRICE_ELEC, LOAN_OFFERS, REPAIR_COST_BASE, APP_VERSION, BUILD_DATE } from './constants';
import { calculateDistance, generateJobs, getCityById } from './utils/gameLogic';

// --- COMPONENTS ---

// 1. Map Component (Visually Enhanced & Theme Aware with Zoom/Pan)
const GameMap = ({ cities, trucks, hqId, ownedGarages, onCityClick, activeFilter, isDarkMode }: any) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const hasMoved = useRef(false); // Ref to distinguish click from drag

  // Theme styles for map
  const mapStyle = isDarkMode ? {
      backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Europe_relief_laea_location_map.jpg/1280px-Europe_relief_laea_location_map.jpg')",
      filter: 'grayscale(100%) contrast(1.1) brightness(0.35) sepia(20%) hue-rotate(180deg)' // Dark Blue/Slate Tech Look
  } : {
      backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Europe_relief_laea_location_map.jpg/1280px-Europe_relief_laea_location_map.jpg')",
      filter: 'grayscale(20%) contrast(1.0) brightness(1.05) sepia(10%)' // Light Paper Map Look
  };

  const gridGradient = isDarkMode 
      ? 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)'
      : 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)';

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      hasMoved.current = false;
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Simple threshold to detect actual movement vs jitter
      if (Math.abs(newX - pan.x) > 2 || Math.abs(newY - pan.y) > 2) {
          hasMoved.current = true;
      }
      setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.stopPropagation(); // Allow page scroll if not focusing map? No, map zoom.
      const scaleAmount = -e.deltaY * 0.001;
      const newZoom = Math.min(Math.max(1, zoom + scaleAmount), 8); // Max zoom 8x
      setZoom(newZoom);
  };

  const resetMap = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
  };

  const handleCityClickInternal = (city: City) => {
      if (!hasMoved.current) {
          onCityClick(city);
      }
  };

  return (
    <div 
        className={`relative w-full h-full border rounded-lg overflow-hidden shadow-2xl group select-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-200'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      
      {/* Transform Container */}
      <div 
        style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
            transformOrigin: '0 0',
            width: '100%', 
            height: '100%',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
          {/* Real Map Layer */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-1000" 
            style={{
                ...mapStyle,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
            }}
          />
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: gridGradient, backgroundSize: '40px 40px' }}>
          </div>

          <svg viewBox="0 0 1000 1000" className="w-full h-full relative z-10">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <filter id="hqGlow" x="-50%" y="-50%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Hub Connections */}
            {activeFilter === 'hubs' && cities.filter((c:City) => c.isHub).map((c1:City, i:number) => (
                 cities.filter((c2:City) => c2.isHub && i < cities.indexOf(c2) && calculateDistance(c1, c2) < 600).map((c2:City) => (
                     <line 
                        key={`${c1.id}-${c2.id}`} 
                        x1={c1.x} y1={c1.y} 
                        x2={c2.x} y2={c2.y} 
                        stroke={isDarkMode ? "#475569" : "#94a3b8"} 
                        strokeWidth={0.5 / zoom} // Keep stroke thin when zoomed
                        opacity="0.3" 
                     />
                 ))
            ))}

            {/* Cities */}
            {cities.map((city: City) => {
              const isHQ = city.id === hqId;
              const isGarage = ownedGarages && ownedGarages.includes(city.id);
              const hasTruck = trucks.some((t: Truck) => t.locationId === city.id);
              const isHub = city.isHub;
              
              if (!isHub && !hasTruck && !isHQ && !isGarage && activeFilter === 'hubs') return null;
              
              // Colors based on theme
              const hqColor = '#3b82f6'; // Blue-500
              const garageColor = '#a855f7'; // Purple-500
              const hubColor = isDarkMode ? '#e2e8f0' : '#475569';
              const truckColor = '#10b981'; // Green-500

              // Scale elements inversely to zoom to keep them readable but positioned correctly
              const radiusScale = Math.max(0.3, 1 / Math.sqrt(zoom)); 

              return (
                <g key={city.id} onClick={() => handleCityClickInternal(city)} className="cursor-pointer hover:opacity-100 opacity-90 transition-opacity group-city">
                  
                  {isHQ && (
                     <circle cx={city.x} cy={city.y} r={15 * radiusScale} fill="none" stroke={hqColor} strokeWidth={1 * radiusScale} opacity="0.5">
                        <animate attributeName="r" from={5 * radiusScale} to={25 * radiusScale} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                     </circle>
                  )}

                  <circle 
                    cx={city.x} 
                    cy={city.y} 
                    r={(isHQ ? 6 : (isGarage ? 5 : (isHub ? 3 : 1.5))) * radiusScale} 
                    fill={isHQ ? '#60a5fa' : (isGarage ? garageColor : hubColor)} 
                    filter={isHQ || isGarage ? 'url(#hqGlow)' : (isHub && isDarkMode ? 'url(#glow)' : '')}
                    stroke={isHQ || isGarage ? '#fff' : 'none'}
                    strokeWidth={(isHQ || isGarage ? 1 : 0) * radiusScale}
                  />

                  {hasTruck && (
                    <circle cx={city.x} cy={city.y} r={(isHub ? 8 : 6) * radiusScale} fill="none" stroke={truckColor} strokeWidth={1.5 * radiusScale} />
                  )}

                  {(isHub || isHQ || isGarage) && (
                    <text 
                        x={city.x} 
                        y={city.y - (8 * radiusScale)} 
                        textAnchor="middle" 
                        fill={isHQ ? '#60a5fa' : (isGarage ? '#d8b4fe' : (isDarkMode ? '#94a3b8' : '#1e293b'))} 
                        fontSize={Math.max(4, (isHQ ? 14 : (isGarage ? 12 : 10)) / zoom)} // Scale text size down when zoomed in
                        fontWeight={isHQ || !isDarkMode ? "bold" : "normal"}
                        className="pointer-events-none drop-shadow-md select-none font-sans"
                        style={{ textShadow: isDarkMode ? '0px 2px 4px rgba(0,0,0,0.9)' : '0px 1px 2px rgba(255,255,255,0.8)' }}
                    >
                      {city.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Active Route Lines */}
            {trucks.filter((t: Truck) => t.status === 'MOVING' && t.destinationId).map((t: Truck) => {
               const start = getCityById(t.locationId);
               const end = getCityById(t.destinationId!);
               if (!start || !end) return null;
               const midX = (start.x + end.x) / 2;
               const midY = (start.y + end.y) / 2;
               return (
                 <g key={`route-${t.id}`}>
                    <line 
                        x1={start.x} y1={start.y} 
                        x2={end.x} y2={end.y} 
                        stroke="#10b981" 
                        strokeWidth={1 / zoom} 
                        strokeDasharray={`${4/zoom},${4/zoom}`}
                        opacity="0.6"
                    />
                    <g>
                        <rect 
                            x={midX - (3 / zoom)} 
                            y={midY - (3 / zoom)} 
                            width={6 / zoom} 
                            height={6 / zoom} 
                            rx={1 / zoom}
                            fill="#10b981" 
                            filter={isDarkMode ? "url(#glow)" : ""}
                            className="animate-pulse"
                        />
                    </g>
                 </g>
               );
            })}
          </svg>
      </div>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          <div className={`p-2 rounded-lg shadow-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => setZoom(z => Math.min(z + 0.5, 8))} 
                className={`p-2 rounded hover:bg-blue-600 hover:text-white transition ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                title="Zoom In"
              >
                  <ZoomIn size={20}/>
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(z - 0.5, 1))} 
                className={`p-2 rounded hover:bg-blue-600 hover:text-white transition ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                title="Zoom Out"
              >
                  <ZoomOut size={20}/>
              </button>
              <div className={`h-px w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              <button 
                onClick={resetMap} 
                className={`p-2 rounded hover:bg-red-600 hover:text-white transition ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                title="Karte Zurücksetzen"
              >
                  <RotateCcw size={20}/>
              </button>
          </div>
      </div>
      
      {/* Legend */}
      <div className={`absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <div className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded border backdrop-blur-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-300'}`}>
             <div className="w-2 h-2 rounded-full bg-blue-400"></div> Hauptquartier
          </div>
          <div className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded border backdrop-blur-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-300'}`}>
             <div className="w-2 h-2 rounded-full bg-purple-500"></div> Niederlassung
          </div>
          <div className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded border backdrop-blur-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-300'}`}>
             <div className="w-2 h-2 bg-green-500 rounded-sm"></div> LKW (Unterwegs)
          </div>
          <div className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded border backdrop-blur-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-300'}`}>
             <Move size={10} /> Zoomen & Ziehen möglich
          </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'MAP' | 'MARKET' | 'FLEET' | 'GARAGE' | 'HR' | 'HIGHSCORES' | 'IMPRESSUM' | 'PRIVACY' | 'HELP' | 'ADMIN'>('LOGIN');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>('USER');
  const [userAvatar, setUserAvatar] = useState<string>('User'); // Default icon name
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [day, setDay] = useState(1);
  const [company, setCompany] = useState<PlayerCompany>({
    name: '',
    money: STARTING_CAPITAL,
    loan: 0,
    interestRate: 0.05,
    hqCityId: '',
    ownedGarages: [],
    garageLevel: 1,
    reputation: 0
  });
  
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]); // New trailer state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [recruits, setRecruits] = useState<Driver[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [activeJobs, setActiveJobs] = useState<Record<string, string>>({}); 
  const [highscores, setHighscores] = useState<HighScore[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<{ name: string, revenue: number }[]>([]);

  // Admin Data
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Selection States
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'hubs'>('all');
  const [marketLocationFilter, setMarketLocationFilter] = useState<boolean>(false);
  const [garageBuySelection, setGarageBuySelection] = useState<string>('');
  const [deliveryGarageId, setDeliveryGarageId] = useState<string>(''); 
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number>(1); 
  const [hrLocationFilter, setHrLocationFilter] = useState<string>('all'); 

  // Filters
  const [marketFilter, setMarketFilter] = useState<{
      cargo: string, 
      minPrice: number,
      minDist: number,
      maxDist: number,
      sort: string,
      classType: 'all' | 'light' | 'heavy'
  }>({ 
      cargo: 'all', 
      minPrice: 0,
      minDist: 0,
      maxDist: 5000,
      sort: 'payout-desc',
      classType: 'all'
  });

  // Shop Filters
  const [shopTab, setShopTab] = useState<'VEHICLES' | 'TRAILERS'>('VEHICLES');
  const [shopVehicleSubTab, setShopVehicleSubTab] = useState<'NEW' | 'USED'>('NEW');
  const [shopTrailerSubTab, setShopTrailerSubTab] = useState<'NEW' | 'USED'>('NEW');
  
  const [dealerFilter, setDealerFilter] = useState<{
      types: Record<string, boolean>;
      maxPrice: number;
      minSpeed: number;
  }>({
      types: { [TruckType.CAR]: true, [TruckType.SMALL]: true, [TruckType.TRACTOR]: true, [TruckType.HEAVY_DUTY]: true, [TruckType.ELECTRIC]: true },
      maxPrice: 300000,
      minSpeed: 0
  });

  // Fleet View Filter
  const [fleetViewMode, setFleetViewMode] = useState<'TRUCKS' | 'TRAILERS'>('TRUCKS');

  const [driverSort, setDriverSort] = useState<'name' | 'skill' | 'salary'>('skill');
  const [recruitSort, setRecruitSort] = useState<'skill' | 'salary'>('skill');

  // --- THEME ---
  const t = useMemo(() => isDarkMode ? {
      bg: 'bg-slate-950',
      panel: 'bg-slate-900',
      card: 'bg-slate-800',
      border: 'border-slate-700',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      input: 'bg-slate-700 border-slate-600 text-white',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-600',
      hover: 'hover:bg-slate-700',
      success: 'text-green-400',
      danger: 'text-red-400',
      shadow: 'shadow-2xl'
  } : {
      bg: 'bg-gray-100',
      panel: 'bg-white',
      card: 'bg-white shadow-sm',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      input: 'bg-gray-50 border-gray-300 text-gray-900',
      accent: 'text-blue-600',
      accentBg: 'bg-blue-600',
      hover: 'hover:bg-gray-100',
      success: 'text-green-600',
      danger: 'text-red-600',
      shadow: 'shadow-xl'
  }, [isDarkMode]);

  // --- HELPER FOR AVATARS & ICONS ---
  const renderAvatar = (iconName: string, size = 20) => {
      switch(iconName) {
          case 'UserCheck': return <UserCheck size={size}/>;
          case 'UserCog': return <UserCog size={size}/>;
          case 'UserPlus': return <UserPlus size={size}/>;
          case 'Smile': return <Smile size={size}/>;
          default: return <User size={size}/>;
      }
  };

  const renderTruckIcon = (type: TruckType, size = 24) => {
      switch(type) {
          case TruckType.CAR: return <Car size={size} />;
          case TruckType.SMALL: return <TruckIcon size={size} className="scale-75" />; // Visual diff
          case TruckType.TRACTOR: return <TruckIcon size={size} />;
          case TruckType.HEAVY_DUTY: return <div className="relative"><TruckIcon size={size}/><Box size={10} className="absolute -top-1 -right-1"/></div>;
          case TruckType.ELECTRIC: return <div className="relative"><TruckIcon size={size}/><Zap size={10} className="absolute top-0 right-0 text-yellow-400"/></div>;
          default: return <TruckIcon size={size}/>;
      }
  }

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedScores = localStorage.getItem('euroTycoonScores');
    if (savedScores) {
      setHighscores(JSON.parse(savedScores));
    }
    // Load Users Registry for Admin
    const registry = localStorage.getItem('euroTycoon_users');
    if (registry) setAllUsers(JSON.parse(registry) as UserProfile[]);
  }, []);

  useEffect(() => {
    if (company.hqCityId && !deliveryGarageId) {
        setDeliveryGarageId(company.hqCityId);
    }
  }, [company.hqCityId]);

  const refreshRecruits = () => {
      const newRecruits: Driver[] = [];
      for(let i=0; i<12; i++) {
          const name = DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
          const baseSkill = 1 + Math.random() * 6;
          const baseSalary = 2000 + (baseSkill * 300) + (Math.random() * 500);
          newRecruits.push({
              id: `recruit-${Date.now()}-${i}`,
              name: `${name} ${String.fromCharCode(65+i)}`,
              salary: Math.floor(baseSalary),
              skill: parseFloat(baseSkill.toFixed(1)),
              status: 'IDLE'
          });
      }
      setRecruits(newRecruits);
  }

  // --- USER REGISTRY MANAGEMENT ---
  const registerUserInRegistry = (username: string, role: 'USER' | 'ADMIN' = 'USER') => {
      const newUser: UserProfile = {
          username,
          role,
          isLocked: false,
          created: new Date().toLocaleDateString(),
          lastLogin: new Date().toLocaleDateString(),
          avatar: 'User'
      };
      
      const updatedUsers = [...allUsers.filter(u => u.username !== username), newUser];
      setAllUsers(updatedUsers);
      localStorage.setItem('euroTycoon_users', JSON.stringify(updatedUsers));
  }
  
  const updateUserLoginDate = (username: string) => {
      const updated = allUsers.map(u => u.username === username ? {...u, lastLogin: new Date().toLocaleDateString()} : u);
      setAllUsers(updated);
      localStorage.setItem('euroTycoon_users', JSON.stringify(updated));
  }

  const updateUserProfile = (username: string, newAvatar: string) => {
      const updated = allUsers.map(u => u.username === username ? {...u, avatar: newAvatar} : u);
      setAllUsers(updated);
      localStorage.setItem('euroTycoon_users', JSON.stringify(updated));
      setUserAvatar(newAvatar);
  }

  // --- AUTH & SAVE SYSTEM ---
  const saveGame = (user: string) => {
    if (!user) return;
    const gameState = {
        day, company, trucks, trailers, drivers, recruits, jobs, events, activeJobs, revenueHistory
    };
    localStorage.setItem(`gameState_${user}`, JSON.stringify(gameState));
    
    // Save Score
    const score: HighScore = { companyName: company.name, netWorth: company.money - company.loan + trucks.reduce((a,b) => a + b.value, 0), date: new Date().toLocaleDateString() };
    const newScores = [...highscores, score].sort((a,b) => b.netWorth - a.netWorth).slice(0, 10);
    setHighscores(newScores);
    localStorage.setItem('euroTycoonScores', JSON.stringify(newScores));
  };

  const loadGame = (user: string) => {
    // Check registry first
    const profile = allUsers.find(u => u.username === user);
    if (profile && profile.isLocked) {
        alert("Dieser Benutzer ist gesperrt. Bitte wenden Sie sich an den Administrator.");
        return false;
    }

    const saved = localStorage.getItem(`gameState_${user}`);
    if (saved) {
        const state = JSON.parse(saved);
        setDay(state.day);
        setCompany(state.company);
        setTrucks(state.trucks);
        setTrailers(state.trailers || []); // Load trailers
        setDrivers(state.drivers);
        setRecruits(state.recruits);
        setJobs(state.jobs);
        setEvents(state.events);
        setActiveJobs(state.activeJobs);
        setRevenueHistory(state.revenueHistory);
        setCurrentUser(user);
        
        // Role check
        if (profile) {
            setUserRole(profile.role);
            setUserAvatar(profile.avatar || 'User');
            updateUserLoginDate(user);
        } else {
            // Legacy/First time load without registry entry (should not happen in new flow)
            setUserRole(user === 'admin' ? 'ADMIN' : 'USER');
            setUserAvatar('User');
            registerUserInRegistry(user, user === 'admin' ? 'ADMIN' : 'USER');
        }

        setView('DASHBOARD');
        return true;
    }
    return false;
  };

  const handleRegister = (user: string, name: string, hqId: string) => {
      // Check if user exists
      if(localStorage.getItem(`gameState_${user}`)) {
          alert("Benutzername existiert bereits!");
          return;
      }

      const loanOffer = LOAN_OFFERS[selectedLoanIndex];
      const newCompany: PlayerCompany = {
          name, 
          hqCityId: hqId, 
          ownedGarages: [hqId],
          money: STARTING_CAPITAL + loanOffer.amount,
          loan: loanOffer.amount,
          interestRate: loanOffer.rate,
          garageLevel: 1,
          reputation: 0
      };

      setCompany(newCompany);
      setDeliveryGarageId(hqId);
      setTrucks([]);
      setTrailers([]);
      setDrivers([]);
      setDay(1);
      setEvents([{
          id: 'start',
          title: 'Firma gegründet!',
          message: `Willkommen in ${getCityById(hqId)?.name}. Kredit: ${loanOffer.name}.`,
          type: 'SUCCESS',
          date: 1
      }]);
      setRevenueHistory([]);
      
      // Init Jobs
      setJobs(generateJobs(CITIES, 1, [hqId]));
      refreshRecruits();

      setCurrentUser(user);
      const role = user === 'admin' ? 'ADMIN' : 'USER';
      setUserRole(role);
      setUserAvatar('User');
      
      // Save initial state immediately
      localStorage.setItem(`gameState_${user}`, JSON.stringify({
          day: 1, company: newCompany, trucks: [], trailers: [], drivers: [], recruits: [], jobs: [], events: [], activeJobs: {}, revenueHistory: []
      }));
      
      // Register in list
      registerUserInRegistry(user, role);
      
      setView('DASHBOARD');
  };

  const handleLogout = () => {
      if (currentUser) saveGame(currentUser);
      setCurrentUser(null);
      setUserRole('USER');
      setView('LOGIN');
      setAuthMode('LOGIN');
  };

  // --- ADMIN ACTIONS ---
  const adminDeleteUser = (targetUser: string) => {
      if(confirm(`Benutzer ${targetUser} wirklich löschen? Alle Daten gehen verloren.`)) {
          localStorage.removeItem(`gameState_${targetUser}`);
          const updated = allUsers.filter(u => u.username !== targetUser);
          setAllUsers(updated);
          localStorage.setItem('euroTycoon_users', JSON.stringify(updated));
      }
  };

  const adminToggleLock = (targetUser: string) => {
      const updated = allUsers.map(u => u.username === targetUser ? {...u, isLocked: !u.isLocked} : u);
      setAllUsers(updated);
      localStorage.setItem('euroTycoon_users', JSON.stringify(updated));
  };

  const adminToggleRole = (targetUser: string) => {
      const updated = allUsers.map(u => u.username === targetUser ? {...u, role: (u.role === 'ADMIN' ? 'USER' : 'ADMIN') as 'USER' | 'ADMIN'} : u);
      setAllUsers(updated);
      localStorage.setItem('euroTycoon_users', JSON.stringify(updated));
  }

  const addEvent = (event: GameEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
  };

  // --- GAME LOOP ---
  const handleNextDay = () => {
    const currentDayStats = day;
    setDay(d => d + 1);
    let dailyLog: string[] = [];
    let moneyChange = 0;
    let dailyRevenue = 0;

    // 1. Process Loans
    const dailyInterest = Math.floor(company.loan * (company.interestRate / 30));
    moneyChange -= dailyInterest;
    if (dailyInterest > 0) dailyLog.push(`Zinsen gezahlt: -${dailyInterest}€`);

    // 2. Process Trucks & Active Jobs
    const updatedTrucks = trucks.map(truck => {
      let t = { ...truck };
      const model = TRUCK_MODELS.find(m => m.id === t.modelId);

      if (t.status === 'MOVING' && t.destinationId) {
        const destCity = getCityById(t.destinationId);
        const startCity = getCityById(t.locationId);
        
        if (destCity && startCity) {
            const driver = drivers.find(d => d.assignedTruckId === t.id);
            const speedFactor = (model?.speed || 1) * (1 + (driver?.skill || 0) * 0.02);
            
            const distance = calculateDistance(startCity, destCity);
            let fuelConsumed = (distance / 100) * (model?.fuelConsumption || 30);
            
            if (driver) fuelConsumed *= (1 - (driver.skill * 0.03));
            
            if (t.currentFuel < fuelConsumed) {
                t.status = 'IDLE'; 
                addEvent({ id: `fuel-${Date.now()}`, title: 'Treibstoff leer!', message: `LKW ${model?.name} ist liegengeblieben! Notbetankung teuer bezahlt.`, type: 'ERROR', date: day });
                moneyChange -= 5000; 
                t.currentFuel = t.maxFuel * 0.2; 
            } else {
                t.currentFuel -= fuelConsumed;
                t.locationId = t.destinationId!;
                t.destinationId = undefined;
                t.status = 'IDLE';
                
                // Move Attached Trailer
                if(t.assignedTrailerId) {
                    setTrailers(prev => prev.map(tr => tr.id === t.assignedTrailerId ? {...tr, locationId: t.locationId} : tr));
                }

                const jobId = activeJobs[t.id];
                if (jobId) {
                    const job = jobs.find(j => j.id === jobId);
                    if (job) {
                        moneyChange += job.payout;
                        dailyRevenue += job.payout;
                        dailyLog.push(`Auftrag abgeschlossen: +${job.payout}€`);
                        const newActive = { ...activeJobs };
                        delete newActive[t.id];
                        setActiveJobs(newActive);
                        
                        if (driver) {
                            const newDrivers = drivers.map(d => d.id === driver.id ? { ...d, skill: Math.min(10, d.skill + 0.1) } : d);
                            setDrivers(newDrivers);
                        }
                    }
                } else {
                    dailyLog.push(`LKW angekommen in ${destCity.name} (Leerfahrt).`);
                }
                t.condition = Math.max(0, t.condition - (distance * 0.0001)); 
                t.mileage += distance;
            }
        }
      }
      if (t.status !== 'BROKEN' && Math.random() > 0.99 && t.condition < 60) {
        t.status = 'BROKEN';
        addEvent({ id: `break-${Math.random()}`, title: 'Panne!', message: `Ein LKW hat einen Motorschaden. Reparatur nötig.`, type: 'ERROR', date: day });
      }
      return t;
    });

    setTrucks(updatedTrucks);

    // 3. Salaries & Firing Logic
    const salaryCost = drivers.reduce((acc, d) => acc + d.salary, 0);
    if (salaryCost > 0) {
        moneyChange -= salaryCost;
        dailyLog.push(`Löhne gezahlt: -${salaryCost}€`);
    }

    // Process Firing Dates (Notice Period)
    const activeDrivers = drivers.filter(d => {
        if (d.firingDate && d.firingDate <= day + 1) { // +1 because we already incremented day
            dailyLog.push(`${d.name} hat die Firma verlassen.`);
            // Unassign truck
            const truck = trucks.find(t => t.id === d.assignedTruckId);
            if (truck) {
                setTrucks(prev => prev.map(pt => pt.id === truck.id ? {...pt, driverId: undefined} : pt));
            }
            return false; // Remove from list
        }
        return true;
    });
    setDrivers(activeDrivers);

    setCompany(c => ({...c, money: c.money + moneyChange}));
    
    setRevenueHistory(prev => {
        const newData = [...prev, { name: `Tag ${currentDayStats}`, revenue: dailyRevenue }];
        return newData.slice(-10); 
    });

    // 5. Refresh Jobs - GUARANTEE 20 JOBS PER LOCATION
    const activeJobIds = Object.values(activeJobs);
    const validJobs = jobs.filter(j => j.expiresInDays > 0 && !activeJobIds.includes(j.id));
    const nextJobs = validJobs.map(j => ({ ...j, expiresInDays: j.expiresInDays - 1 }));
    
    // Collect all important locations (Trucks + Garages)
    const activeLocations = new Set<string>();
    updatedTrucks.forEach(t => activeLocations.add(t.locationId));
    company.ownedGarages.forEach(g => activeLocations.add(g));

    // Replenish
    const newJobs = generateJobs(CITIES, day, Array.from(activeLocations));
    const finalJobs = [...nextJobs.filter(j => activeJobIds.includes(j.id)), ...newJobs];

    setJobs(finalJobs);

    if (day % 7 === 0) refreshRecruits();

    if (Math.random() > 0.8) {
        const eventTypes = [
            { t: 'Stau auf der A7', m: 'Verzögerungen im Norden.', type: 'WARNING' },
            { t: 'Streik in Frankreich', m: 'Grenzübergänge blockiert.', type: 'WARNING' },
            { t: 'Dieselpreise fallen', m: 'Treibstoff günstiger diese Woche.', type: 'SUCCESS' },
            { t: 'Schneesturm', m: 'Gefährliche Straßenverhältnisse in den Alpen.', type: 'INFO' }
        ];
        const evt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        addEvent({ id: `world-${Math.random()}`, title: evt.t, message: evt.m, type: evt.type as any, date: day });
    }

    // Auto-save every day
    if(currentUser) {
        saveGame(currentUser);
    }

    if (company.money < -50000) {
        alert("Sie sind bankrott! Game Over.");
        setView('LOGIN');
        setAuthMode('LOGIN');
        setCurrentUser(null);
    }
  };

  const handleManualSave = () => {
      if(currentUser) {
          saveGame(currentUser);
          addEvent({ id: `save-${Date.now()}`, title: 'Gespeichert', message: 'Spielstand gesichert.', type: 'SUCCESS', date: day });
      }
  };

  // --- ACTIONS ---
  const fireDriver = (driverId: string) => {
      if(confirm("Mitarbeiter kündigen? Es gilt eine Frist von 3 Tagen (Runden), in denen weiter Gehalt gezahlt wird.")) {
          setDrivers(drivers.map(d => d.id === driverId ? { ...d, firingDate: day + 3 } : d));
          addEvent({ id: `fire-${Date.now()}`, title: 'Kündigung', message: `Kündigung ausgesprochen. Austritt in 3 Tagen.`, type: 'WARNING', date: day });
      }
  }

  const assignDriverToTruck = (driverId: string, truckId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if(!driver) return;

      const oldTruck = trucks.find(t => t.id === driver.assignedTruckId);
      
      const updatedTrucks = trucks.map(t => {
          if (t.id === driver.assignedTruckId) return { ...t, driverId: undefined };
          if (t.id === truckId) return { ...t, driverId: driverId }; 
          if (t.driverId === driverId && t.id !== truckId) return { ...t, driverId: undefined }; 
          return t;
      });

      const targetTruck = trucks.find(t => t.id === truckId);
      let updatedDrivers = drivers;

      if (targetTruck && targetTruck.driverId && targetTruck.driverId !== driverId) {
          updatedDrivers = updatedDrivers.map(d => d.id === targetTruck.driverId ? { ...d, assignedTruckId: undefined } : d);
      }

      updatedDrivers = updatedDrivers.map(d => d.id === driverId ? { ...d, assignedTruckId: truckId || undefined } : d);

      setTrucks(updatedTrucks);
      setDrivers(updatedDrivers);
  };

  const buyTruck = (model: TruckModel, condition: TruckCondition) => {
    let price = model.priceNew;
    let initCond = 100;
    let mileage = 0;
    if (condition === TruckCondition.USED_GOOD) { price *= 0.7; initCond = 70; mileage = 150000; }
    if (condition === TruckCondition.USED_BAD) { price *= 0.4; initCond = 40; mileage = 500000; }
    const targetCityId = deliveryGarageId || company.hqCityId;

    if (company.money >= price) {
      setCompany(c => ({ ...c, money: c.money - price }));
      const newTruck: Truck = {
        id: `truck-${Date.now()}`, modelId: model.id, mileage, condition: initCond, status: 'IDLE',
        locationId: targetCityId, currentFuel: 1000, maxFuel: 1000, boughtPrice: price, value: price
      };
      setTrucks([...trucks, newTruck]);
      addEvent({ id: `buy-${Date.now()}`, title: 'Fahrzeug Gekauft', message: `${model.name} (${condition}) geliefert.`, type: 'SUCCESS', date: day });
    } else { alert("Nicht genug Geld!"); }
  };

  const buyTrailer = (model: ShopTrailer, isUsed: boolean) => {
      const targetCityId = deliveryGarageId || company.hqCityId;
      const finalPrice = isUsed ? Math.floor(model.price * 0.6) : model.price;
      const condition = isUsed ? 40 + Math.random() * 30 : 100;

      if (company.money >= finalPrice) {
          setCompany(c => ({ ...c, money: c.money - finalPrice }));
          const newTrailer: Trailer = {
              id: `trailer-${Date.now()}`,
              modelId: model.id,
              condition: condition,
              locationId: targetCityId,
              value: finalPrice
          };
          setTrailers([...trailers, newTrailer]);
          addEvent({ id: `buy-trl-${Date.now()}`, title: 'Anhänger Gekauft', message: `${model.name} ${isUsed ? '(Gebraucht)' : '(Neu)'} geliefert.`, type: 'SUCCESS', date: day });
      } else { alert("Nicht genug Geld!"); }
  }

  const toggleTrailerAttachment = (truckId: string, trailerId?: string) => {
      const truck = trucks.find(t => t.id === truckId);
      if(!truck) return;

      if(truck.assignedTrailerId) {
          // Detach
          const trl = trailers.find(t => t.id === truck.assignedTrailerId);
          setTrucks(prev => prev.map(t => t.id === truckId ? {...t, assignedTrailerId: undefined} : t));
          setTrailers(prev => prev.map(t => t.id === truck.assignedTrailerId ? {...t, isAttachedTo: undefined, locationId: truck.locationId} : t));
          addEvent({ id: `detach-${Date.now()}`, title: 'Abgekoppelt', message: 'Anhänger steht bereit.', type: 'INFO', date: day });
      } else if (trailerId) {
          // Attach
          const trl = trailers.find(t => t.id === trailerId);
          setTrucks(prev => prev.map(t => t.id === truckId ? {...t, assignedTrailerId: trailerId} : t));
          setTrailers(prev => prev.map(t => t.id === trailerId ? {...t, isAttachedTo: truckId} : t));
          addEvent({ id: `attach-${Date.now()}`, title: 'Angekoppelt', message: 'Anhänger verbunden.', type: 'INFO', date: day });
      }
  }

  const getTruckCapacity = (truck: Truck) => {
      const model = TRUCK_MODELS.find(m => m.id === truck.modelId);
      let cap = model?.capacity || 0;
      if (truck.assignedTrailerId) {
          const trl = trailers.find(t => t.id === truck.assignedTrailerId);
          const trlModel = SHOP_TRAILERS.find(m => m.id === trl?.modelId);
          if (trlModel) cap += trlModel.capacity;
      }
      return cap;
  }

  // Check if current setup (Truck + Trailer) is compatible with cargo type
  const isSetupCompatible = (truck: Truck, cargo: CargoType) => {
      const model = TRUCK_MODELS.find(m => m.id === truck.modelId);
      if(!model) return false;

      // 1. Truck has no trailer?
      if (!truck.assignedTrailerId) {
          // Only if the truck itself has body capacity (Van, Box Truck)
          // Tractors (capacity 0) cannot carry anything alone
          if (model.capacity > 0) {
              // Assume vans/cars can carry GENERAL, EXPRESS, MAIL, TOOLS, ELECTRONICS
              const generalTypes = [CargoType.GENERAL, CargoType.EXPRESS, CargoType.MAIL, CargoType.TOOLS, CargoType.ELECTRONICS, CargoType.FURNITURE];
              return generalTypes.includes(cargo);
          }
          return false;
      }

      // 2. Truck has trailer? Check trailer type compatibility
      const trl = trailers.find(t => t.id === truck.assignedTrailerId);
      const trlModel = SHOP_TRAILERS.find(m => m.id === trl?.modelId);
      if (!trlModel) return false;

      const compatibleTypes = TRAILER_COMPATIBILITY[trlModel.type];
      return compatibleTypes && compatibleTypes.includes(cargo);
  }

  const sellTruck = (truck: Truck) => {
      const sellValue = Math.floor(truck.value * 0.8 * (truck.condition / 100));
      if(!confirm(`LKW verkaufen für ${sellValue}€?`)) return;
      
      setCompany(c => ({ ...c, money: c.money + sellValue }));
      setTrucks(trucks.filter(t => t.id !== truck.id));
      if(truck.driverId) setDrivers(drivers.map(d => d.id === truck.driverId ? {...d, assignedTruckId: undefined} : d));
      // Detach trailer if exists
      if(truck.assignedTrailerId) {
          setTrailers(prev => prev.map(t => t.id === truck.assignedTrailerId ? {...t, isAttachedTo: undefined, locationId: truck.locationId} : t));
      }
      addEvent({ id: `sell-${Date.now()}`, title: 'Verkauft', message: `LKW verkauft.`, type: 'INFO', date: day });
  };

  const sellTrailer = (trailer: Trailer) => {
      const sellValue = Math.floor(trailer.value * 0.8 * (trailer.condition / 100));
      if(!confirm(`Anhänger verkaufen für ${sellValue}€?`)) return;

      setCompany(c => ({...c, money: c.money + sellValue}));
      setTrailers(prev => prev.filter(t => t.id !== trailer.id));
      
      // If attached, update truck
      if(trailer.isAttachedTo) {
          setTrucks(prev => prev.map(t => t.id === trailer.isAttachedTo ? {...t, assignedTrailerId: undefined} : t));
      }
      addEvent({ id: `sell-trl-${Date.now()}`, title: 'Verkauft', message: `Anhänger verkauft.`, type: 'INFO', date: day });
  }

  const repairTruck = (truck: Truck) => {
      const damage = 100 - truck.condition;
      const baseCost = truck.status === 'BROKEN' ? REPAIR_COST_BASE * 2 : 0; 
      const totalCost = Math.floor(baseCost + damage * 150);
      if(totalCost === 0) return;
      if (company.money >= totalCost) {
          if (confirm(`Reparatur für ${totalCost}€?`)) {
               setCompany(c => ({...c, money: c.money - totalCost}));
               setTrucks(trucks.map(t => t.id === truck.id ? {...t, condition: 100, status: t.status === 'BROKEN' ? 'IDLE' : t.status} : t));
               addEvent({ id: `repair-${Date.now()}`, title: 'Reparatur', message: `LKW repariert.`, type: 'INFO', date: day });
          }
      } else { alert("Nicht genug Geld!"); }
  };
  const hireSpecificDriver = (recruit: Driver) => {
      const fee = 1000; 
      if(company.money >= fee) {
          const newDriver = { ...recruit, id: `driver-${Date.now()}`, status: 'IDLE' as const };
          setDrivers([...drivers, newDriver]);
          setRecruits(recruits.filter(r => r.id !== recruit.id));
          setCompany(c => ({...c, money: c.money - fee}));
          addEvent({ id: `hire-${Date.now()}`, title: 'Eingestellt', message: `${newDriver.name} eingestellt.`, type: 'SUCCESS', date: day });
      } else { alert("Nicht genug Geld!"); }
  };
  const buyGarage = (cityId: string) => {
      if (company.money >= 250000) {
          setCompany(c => ({...c, money: c.money - 250000, ownedGarages: [...c.ownedGarages, cityId]}));
          setGarageBuySelection('');
          addEvent({ id: `garage-${Date.now()}`, title: 'Expansion!', message: `Neue Niederlassung eröffnet.`, type: 'SUCCESS', date: day });
      } else { alert("Nicht genug Kapital!"); }
  }
  const trainDriver = (driverId: string) => {
    const d = drivers.find(d => d.id === driverId);
    if (!d || d.skill >= 10) return;
    if (company.money >= 5000) {
        if(confirm(`${d.name} schulen (5.000€)?`)) {
            setCompany(c => ({...c, money: c.money - 5000}));
            setDrivers(drivers.map(drv => drv.id === driverId ? {...drv, skill: Math.min(10, drv.skill + 1.0)} : drv));
            addEvent({ id: `train-${Date.now()}`, title: 'Schulung', message: `${d.name} verbessert.`, type: 'SUCCESS', date: day });
        }
    } else { alert("Nicht genug Geld!"); }
  };
  const assignJob = (truckId: string, job: Job) => {
      const truck = trucks.find(t => t.id === truckId);
      const model = TRUCK_MODELS.find(m => m.id === truck?.modelId);
      if (!truck || !model) return;
      
      // 1. Check Capacity
      const totalCap = getTruckCapacity(truck);
      if (job.weight > totalCap) { alert(`Überladen! Kapazität: ${totalCap}t, Job: ${job.weight}t`); return; }

      // 2. Check Cargo Type Compatibility
      if (!isSetupCompatible(truck, job.cargoType)) {
          const trailer = trailers.find(t => t.id === truck.assignedTrailerId);
          const tName = trailer ? SHOP_TRAILERS.find(m => m.id === trailer.modelId)?.name : 'Kein Anhänger';
          alert(`Falscher Aufbautyp!\nFracht: ${job.cargoType}\nFahrzeug/Trailer: ${tName}`);
          return;
      }

      const truckLoc = getCityById(truck.locationId)!;
      const jobSource = getCityById(job.sourceCityId)!;
      const approachDist = calculateDistance(truckLoc, jobSource);
      const approachFuel = (approachDist / 100) * model.fuelConsumption;
      
      if (truck.currentFuel < approachFuel * 1.1) { alert("Zu wenig Sprit für Anfahrt."); return; }
      if (approachDist > 0) {
           if(!confirm(`Anfahrt: ${Math.round(approachDist)} km. Job starten?`)) return;
      }
      const updatedTrucks = trucks.map(t => t.id === truckId ? { ...t, status: 'MOVING' as const, destinationId: job.targetCityId, currentJobId: job.id, currentFuel: t.currentFuel - approachFuel, locationId: job.sourceCityId } : t);
      setTrucks(updatedTrucks);
      setActiveJobs(prev => ({ ...prev, [truckId]: job.id }));
      addEvent({ id: `job-${Date.now()}`, title: 'Job gestartet', message: `Fahrt nach ${getCityById(job.targetCityId)?.name}.`, type: 'INFO', date: day });
  };
  const sendSolo = (truckId: string, targetCityId: string) => {
      const truck = trucks.find(t => t.id === truckId);
      const model = TRUCK_MODELS.find(m => m.id === truck?.modelId);
      const dist = calculateDistance(getCityById(truck!.locationId)!, getCityById(targetCityId)!);
      const estFuel = (dist / 100) * (model?.fuelConsumption || 30);
      if (truck!.currentFuel < estFuel) { alert("Zu wenig Sprit."); return; }
      setTrucks(trucks.map(t => t.id === truckId ? { ...t, status: 'MOVING' as const, destinationId: targetCityId } : t));
      addEvent({ id: `solo-${Date.now()}`, title: 'Leerfahrt', message: `Unterwegs nach ${getCityById(targetCityId)?.name}.`, type: 'INFO', date: day });
  };
  const refuelTruck = (truck: Truck) => {
      const model = TRUCK_MODELS.find(m => m.id === truck.modelId);
      const missing = truck.maxFuel - truck.currentFuel;
      if (missing < 10) return;
      const cost = Math.floor(missing * (model?.isElectric ? FUEL_PRICE_ELEC : FUEL_PRICE_DIESEL));
      if (company.money >= cost) {
          if(confirm(`Tanken für ${cost}€?`)) {
              setCompany(c => ({...c, money: c.money - cost}));
              setTrucks(trucks.map(t => t.id === truck.id ? {...t, currentFuel: t.maxFuel} : t));
              addEvent({ id: `refuel-${Date.now()}`, title: 'Getankt', message: `Vollgetankt.`, type: 'INFO', date: day });
          }
      } else { alert("Kein Geld!"); }
  };

  // --- RENDERING ---

  // ... LOGIN COMPONENT ...
  if (view === 'LOGIN') {
    return (
      <div className={`h-screen w-full flex items-center justify-center bg-cover bg-center ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-100 text-gray-900'}`} style={{backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className={`relative z-10 p-8 rounded-xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto ${t.panel} ${t.border}`}>
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-4xl font-bold text-blue-500 flex items-center gap-2"><TruckIcon size={40}/> Euro Spedition</h1>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${t.bg}`}>
                    {isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-700"/>}
                </button>
            </div>
            
            {/* Auth Switcher */}
            <div className="flex gap-4 mb-6 border-b border-gray-600 pb-2">
                <button onClick={() => setAuthMode('LOGIN')} className={`text-lg font-bold pb-1 ${authMode === 'LOGIN' ? 'text-blue-500 border-b-2 border-blue-500' : t.textMuted}`}>Einloggen</button>
                <button onClick={() => setAuthMode('REGISTER')} className={`text-lg font-bold pb-1 ${authMode === 'REGISTER' ? 'text-blue-500 border-b-2 border-blue-500' : t.textMuted}`}>Registrieren</button>
            </div>

            {authMode === 'LOGIN' ? (
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Benutzername</label>
                        <input type="text" id="loginUser" className={`w-full rounded p-2 ${t.input}`} />
                     </div>
                     <button 
                        onClick={() => {
                            const user = (document.getElementById('loginUser') as HTMLInputElement).value;
                            if(user) {
                                if(!loadGame(user)) alert("Spielstand nicht gefunden oder fehlerhaft!");
                            }
                        }}
                        className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-bold text-white"
                     >
                         Spielstand Laden
                     </button>
                </div>
            ) : (
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium mb-1">Benutzername</label>
                        <input type="text" id="regUser" className={`w-full rounded p-2 ${t.input}`} />
                     </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Firmenname</label>
                            <input type="text" className={`w-full rounded p-2 mb-4 ${t.input}`} placeholder="z.B. Schmidt Logistik" id="companyNameInput" />

                            <label className="block text-sm font-medium mb-1">Start-Standort (HQ)</label>
                            <div className="text-xs mb-1 text-blue-400">Hier beginnt deine Reise:</div>
                            <select id="hqSelect" className={`w-full rounded p-2 mb-2 ${t.input}`}>
                                {CITIES.filter(c => c.isHub).map(c => ( <option key={c.id} value={c.id}>{c.name} ({c.country})</option> ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Stammkapital: 100.000 €</label>
                            <div className={`text-sm mb-3 ${t.textMuted}`}>Wählen Sie Ihre Finanzierung:</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {LOAN_OFFERS.map((offer, idx) => (
                                    <div key={offer.id} onClick={() => setSelectedLoanIndex(idx)}
                                        className={`p-3 rounded border cursor-pointer transition flex flex-col gap-1 ${selectedLoanIndex === idx ? 'bg-blue-600/20 border-blue-500' : `${t.bg} ${t.border} hover:opacity-80`}`}
                                    >
                                        <div className="flex justify-between font-bold text-sm">
                                            <span>{offer.name}</span>
                                            <span className={offer.amount > 0 ? t.success : t.textMuted}>+{offer.amount.toLocaleString()}€</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => {
                        const user = (document.getElementById('regUser') as HTMLInputElement).value;
                        const name = (document.getElementById('companyNameInput') as HTMLInputElement).value;
                        const hq = (document.getElementById('hqSelect') as HTMLSelectElement).value;
                        if(user && name) handleRegister(user, name, hq);
                        else alert("Bitte alle Felder ausfüllen.");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold transition flex justify-center items-center gap-2 text-white shadow-lg"
                    >
                        <Play size={20} /> Firma Gründen & Starten
                    </button>
                </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-2 text-sm border-t border-gray-700 pt-4">
                <div className="flex gap-4">
                  <button onClick={() => setView('HIGHSCORES')} className={`${t.textMuted} hover:${t.text} underline`}>Highscores</button>
                  <button onClick={() => setView('HELP')} className={`${t.textMuted} hover:${t.text} underline`}>Hilfe</button>
                  <button onClick={() => setView('IMPRESSUM')} className={`${t.textMuted} hover:${t.text} underline`}>Impressum</button>
                  <button onClick={() => setView('PRIVACY')} className={`${t.textMuted} hover:${t.text} underline`}>Datenschutz</button>
                </div>
                <div className={`text-[10px] mt-2 ${t.textMuted}`}>Version: {APP_VERSION} ({BUILD_DATE})</div>
            </div>
        </div>
      </div>
    );
  }

  // --- LEGAL & HELP PAGES ---
  const LegalLayout = ({ title, children }: any) => (
      <div className={`h-screen p-10 overflow-auto ${t.bg} ${t.text}`}>
          <button onClick={() => currentUser ? setView('DASHBOARD') : setView('LOGIN')} className={`mb-4 ${t.accent} hover:underline`}>&larr; Zurück</button>
          <div className={`max-w-3xl mx-auto ${t.panel} p-8 rounded-xl shadow-xl border ${t.border}`}>
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">{title}</h1>
            <div className="prose prose-slate max-w-none">{children}</div>
          </div>
      </div>
  );

  if (view === 'HELP') { return <LegalLayout title={<><HelpCircle/> Spielanleitung</>}><p>Hilfe...</p></LegalLayout> }
  if (view === 'IMPRESSUM') { return <LegalLayout title={<><FileText/> Impressum</>}><p>Impressum...</p></LegalLayout> }
  if (view === 'PRIVACY') { return <LegalLayout title={<><Shield/> Datenschutzerklärung</>}><p>Datenschutz...</p></LegalLayout> }
  if (view === 'HIGHSCORES') { return <LegalLayout title={<><Trophy/> Ruhmeshalle</>}><p>Scores...</p></LegalLayout> } 
  if (view === 'ADMIN') { return <div className={`h-screen p-10 ${t.bg} ${t.text}`}><button onClick={() => setView('DASHBOARD')}>Back</button> Admin Area</div>}

  // --- MAIN APP LAYOUT ---
  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-300 ${t.bg} ${t.text}`}>
      
      {/* HEADER */}
      <header className={`h-16 border-b flex items-center justify-between px-6 shadow-md z-20 ${t.panel} ${t.border}`}>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg"><TruckIcon size={24} className="text-white"/></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{company.name}</h1>
            <div className={`text-xs ${t.textMuted}`}>Tag {day} | Reputation: {company.reputation}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right">
             <div className={`text-xs ${t.textMuted}`}>Kapital</div>
             <div className={`font-mono text-lg font-bold ${company.money < 0 ? t.danger : t.success}`}>
                {company.money.toLocaleString()} €
             </div>
           </div>
           
           <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${t.bg} border ${t.border}`}>
                        {isDarkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-slate-700"/>}
                </button>
                
                {/* User Menu */}
                <div className="group relative">
                    <button className={`flex items-center gap-2 p-2 rounded ${t.hover}`}>
                        {renderAvatar(userAvatar)}
                        <span className="text-sm font-bold">{currentUser}</span>
                        {userRole === 'ADMIN' && <span className="text-[10px] bg-red-600 px-1 rounded text-white">ADMIN</span>}
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded shadow-xl hidden group-hover:block z-50 p-2">
                        {userRole === 'ADMIN' && (
                            <button onClick={() => setView('ADMIN')} className="w-full text-left p-2 hover:bg-slate-800 rounded text-sm mb-1 flex gap-2 text-red-400 font-bold"><ShieldAlert size={14}/> Admin Panel</button>
                        )}
                        <button onClick={() => setShowProfileEditor(true)} className="w-full text-left p-2 hover:bg-slate-800 rounded text-sm mb-1 flex gap-2"><UserCog size={14}/> Profil bearbeiten</button>
                        <button onClick={() => setView('HELP')} className="w-full text-left p-2 hover:bg-slate-800 rounded text-sm mb-1 flex gap-2"><HelpCircle size={14}/> Hilfe</button>
                        <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-red-900/50 text-red-400 rounded text-sm flex gap-2"><LogOut size={14}/> Ausloggen</button>
                    </div>
                </div>
           </div>

           <div className="flex gap-2">
             <button onClick={handleNextDay} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold shadow-lg shadow-green-900/20 active:scale-95 transition">
               <Play size={16} /> Nächster Tag
             </button>
             <button onClick={handleManualSave} className={`p-2 rounded hover:opacity-80 ${t.card} ${t.border} border`}>
                 <Save size={20} />
             </button>
           </div>
        </div>
      </header>

      {/* PROFILE EDITOR MODAL */}
      {showProfileEditor && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className={`max-w-md w-full p-6 rounded-xl ${t.panel} ${t.border} border shadow-2xl`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2"><UserCog /> Profil bearbeiten</h2>
                      <button onClick={() => setShowProfileEditor(false)}><X size={24}/></button>
                  </div>
                  {/* ... (Existing profile editor content) */}
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowProfileEditor(false)} className={`px-4 py-2 rounded ${t.bg}`}>Abbrechen</button>
                      <button onClick={() => { alert("Profil gespeichert!"); setShowProfileEditor(false); }} className="px-4 py-2 rounded bg-green-600 text-white font-bold">Speichern</button>
                  </div>
              </div>
          </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR */}
        <nav className={`w-64 border-r flex flex-col p-4 gap-2 ${t.panel} ${t.border}`}>
          {[
            { id: 'DASHBOARD', label: 'Übersicht', icon: TrendingUp },
            { id: 'MAP', label: 'Europakarte', icon: MapIcon },
            { id: 'MARKET', label: 'Frachtmarkt', icon: ShoppingCart },
            { id: 'FLEET', label: 'Fuhrpark & Händler', icon: TruckIcon },
            { id: 'GARAGE', label: 'Werkstatt & Zentrale', icon: Building2 },
            { id: 'HR', label: 'Personal & HR', icon: Users },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${view === item.id ? 'bg-blue-600 text-white' : `${t.textMuted} hover:${t.bg} hover:${t.text}`}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          
          <div className={`mt-auto border-t pt-4 ${t.border}`}>
            <h3 className={`text-xs font-bold mb-2 uppercase px-2 ${t.textMuted}`}>Ereignisse</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.slice(0, 5).map(e => (
                    <div key={e.id} className={`text-xs p-2 rounded border-l-2 bg-black/5 ${e.type === 'ERROR' ? 'border-red-500' : e.type === 'SUCCESS' ? 'border-green-500' : 'border-blue-500'}`}>
                        <div className="font-bold">{e.title}</div>
                        <div className="opacity-75">{e.message}</div>
                    </div>
                ))}
            </div>
          </div>
        </nav>

        {/* VIEWPORT */}
        <main className={`flex-1 overflow-auto p-6 relative ${t.bg}`}>
          
          {view === 'DASHBOARD' && (
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Stats */}
               <div className="grid grid-cols-3 gap-6">
                 {[
                     { label: 'Aktive Trucks', val: trucks.length, sub: 'Fahrzeuge' },
                     { label: 'Mitarbeiter', val: drivers.length, sub: 'Fahrer' },
                     { label: 'Kreditlast', val: '-' + company.loan.toLocaleString() + ' €', sub: `Zinssatz: ${(company.interestRate*100).toFixed(1)}%`, valClass: t.danger }
                 ].map((stat, i) => (
                     <div key={i} className={`p-6 rounded-xl border ${t.card} ${t.border}`}>
                        <h3 className={`text-sm mb-2 ${t.textMuted}`}>{stat.label}</h3>
                        <div className={`text-3xl font-bold ${stat.valClass || ''}`}>{stat.val} <span className={`text-sm font-normal ${t.textMuted}`}>{stat.sub}</span></div>
                     </div>
                 ))}
               </div>
               {/* Chart */}
               <div className={`p-6 rounded-xl border relative ${t.card} ${t.border}`}>
                   <h2 className="text-xl font-bold mb-4">Firmenstatistik (Tagesumsatz)</h2>
                   <div className="h-64 relative">
                       {revenueHistory.length === 0 ? (
                           <div className={`absolute inset-0 flex items-center justify-center italic ${t.textMuted}`}>Noch keine Daten. Spielen Sie den ersten Tag!</div>
                       ) : (
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={revenueHistory}>
                                   <XAxis dataKey="name" stroke="#64748b" />
                                   <YAxis stroke="#64748b" />
                                   <ReTooltip contentStyle={{backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: isDarkMode ? 'none' : '1px solid #e2e8f0', color: isDarkMode ? '#fff' : '#000'}} />
                                   <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Umsatz" />
                               </BarChart>
                           </ResponsiveContainer>
                       )}
                   </div>
               </div>
            </div>
          )}

          {view === 'MAP' && (
             <div className="h-full flex flex-col">
                <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-bold">Logistik Karte</h2>
                    <div className={`flex gap-2 p-1 rounded ${t.card} ${t.border} border`}>
                        <button onClick={() => setMapFilter('all')} className={`px-3 py-1 text-sm rounded ${mapFilter === 'all' ? 'bg-blue-600 text-white' : ''}`}>Alle Städte</button>
                        <button onClick={() => setMapFilter('hubs')} className={`px-3 py-1 text-sm rounded ${mapFilter === 'hubs' ? 'bg-blue-600 text-white' : ''}`}>Nur Hubs</button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <GameMap 
                        cities={CITIES} trucks={trucks} hqId={company.hqCityId} ownedGarages={company.ownedGarages}
                        activeFilter={mapFilter} isDarkMode={isDarkMode}
                        onCityClick={(c: City) => {
                             if(selectedTruckId) {
                                 const truck = trucks.find(t => t.id === selectedTruckId);
                                 if(truck && truck.status === 'IDLE' && confirm(`${truck.id} leer nach ${c.name} schicken?`)) {
                                     sendSolo(truck.id, c.id);
                                     setSelectedTruckId(null);
                                 }
                             } else { alert(`Stadt: ${c.name}\nLand: ${c.country}`); }
                        }} 
                    />
                    {selectedTruckId && (
                        <div className={`absolute top-4 left-4 p-4 rounded border shadow-xl backdrop-blur max-w-xs z-20 ${t.panel} ${t.border}`}>
                            <h3 className="font-bold mb-2">LKW gewählt</h3>
                            <p className="text-sm mb-2">Zielstadt wählen für Leerfahrt.</p>
                            <button onClick={() => setSelectedTruckId(null)} className={`text-xs px-2 py-1 rounded ${t.bg}`}>Abbrechen</button>
                        </div>
                    )}
                </div>
             </div>
          )}

          {view === 'MARKET' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Frachtmarkt</h2>
                    <div className={`text-sm ${t.textMuted}`}>{jobs.length} Angebote verfügbar</div>
                  </div>

                  <div className={`p-4 rounded-lg border flex flex-wrap gap-4 items-end ${t.card} ${t.border}`}>
                      <button 
                        onClick={() => setMarketLocationFilter(!marketLocationFilter)}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold border ${marketLocationFilter ? 'bg-green-600 border-green-500 text-white' : `${t.bg} ${t.border} ${t.textMuted}`}`}
                      >
                          <CheckCircle size={16} /> Nur meine Standorte
                      </button>

                      {/* Selects for filters */}
                      {[{ label: 'Klasse', val: marketFilter.classType, set: (v:any)=>setMarketFilter(p=>({...p, classType:v})), opts: [['all','Alle'],['light','Bis 3.5t'],['heavy','Ab 3.5t']] },
                        { label: 'Fracht', val: marketFilter.cargo, set: (v:any)=>setMarketFilter(p=>({...p, cargo:v})), opts: [['all','Alle'], ...Object.values(CargoType).map(c=>[c,c])] },
                        { label: 'Sortierung', val: marketFilter.sort, set: (v:any)=>setMarketFilter(p=>({...p, sort:v})), opts: [['payout-desc','€ Hoch'],['payout-asc','€ Tief'],['dist-desc','km Lang'],['dist-asc','km Kurz']] }
                      ].map((f, i) => (
                          <div key={i}>
                              <label className={`block text-xs mb-1 ${t.textMuted}`}>{f.label}</label>
                              <select className={`rounded p-2 text-sm border ${t.input}`} value={f.val} onChange={e => f.set(e.target.value)}>
                                  {f.opts.map((o:any) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
                              </select>
                          </div>
                      ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobs
                        .filter(j => !marketLocationFilter || new Set(trucks.map(t => t.locationId)).has(j.sourceCityId))
                        .filter(j => (marketFilter.classType === 'light' ? j.weight <= 3.5 : (marketFilter.classType === 'heavy' ? j.weight > 3.5 : true)))
                        .filter(j => marketFilter.cargo === 'all' || j.cargoType === marketFilter.cargo)
                        .filter(j => j.distance >= marketFilter.minDist && j.distance <= marketFilter.maxDist)
                        .sort((a,b) => marketFilter.sort === 'payout-desc' ? b.payout - a.payout : marketFilter.sort === 'payout-asc' ? a.payout - b.payout : marketFilter.sort === 'dist-desc' ? b.distance - a.distance : a.distance - b.distance)
                        .slice(0, 50)
                        .map(job => {
                          const idleTrucks = trucks.filter(t => t.status === 'IDLE');
                          return (
                              <div key={job.id} className={`border p-4 rounded-lg transition group relative ${t.card} ${t.border} hover:border-blue-500`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <div className={`text-xs px-2 py-1 rounded font-bold ${job.isUrgent ? 'bg-red-500/20 text-red-500' : `${t.bg} ${t.textMuted}`}`}>{job.isUrgent ? 'DRINGEND' : 'Standard'}</div>
                                      <div className={`font-bold ${t.success}`}>{job.payout.toLocaleString()} €</div>
                                  </div>
                                  <div className="font-bold text-lg mb-1">{job.cargoType}</div>
                                  <div className={`flex items-center gap-2 text-sm mb-4 ${t.textMuted}`}>
                                      <span className="truncate">{getCityById(job.sourceCityId)?.name}</span> &rarr; <span className="truncate">{getCityById(job.targetCityId)?.name}</span>
                                  </div>
                                  <div className={`text-xs mb-4 flex justify-between ${t.textMuted}`}>
                                      <span>{job.distance} km</span>
                                      <span className={job.weight <= 3.5 ? 'text-yellow-500' : ''}>{job.weight}t</span>
                                  </div>
                                  {idleTrucks.length > 0 ? (
                                      <select className={`w-full rounded p-1 text-sm border ${t.input}`} onChange={(e) => {if(e.target.value) assignJob(e.target.value, job)}} defaultValue="">
                                          <option value="" disabled>LKW Wählen...</option>
                                          {idleTrucks.map(t => {
                                              const m = TRUCK_MODELS.find(mod=>mod.id===t.modelId);
                                              const totalCap = getTruckCapacity(t); // Check capacity
                                              if (totalCap < job.weight) return null;
                                              const dist = t.locationId === job.sourceCityId ? 0 : calculateDistance(getCityById(t.locationId)!, getCityById(job.sourceCityId)!);
                                              // New: Add compatibility hint in dropdown
                                              const compatible = isSetupCompatible(t, job.cargoType);
                                              if(!compatible) return null; // Don't show incompatible trucks in dropdown

                                              return <option key={t.id} value={t.id}>{m?.name} ({dist > 0 ? `${Math.round(dist)}km Anfahrt` : 'Vor Ort'})</option>
                                          })}
                                      </select>
                                  ) : <div className={`text-xs italic ${t.danger}`}>Kein LKW frei</div>}
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {view === 'FLEET' && (
              <div className="flex h-full gap-6">
                  {/* LEFT: OWNED FLEET */}
                  <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                      <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-700">
                          <h2 className={`text-xl font-bold`}>Mein Fuhrpark</h2>
                          <div className="flex gap-2">
                              <button onClick={() => setFleetViewMode('TRUCKS')} className={`px-3 py-1 text-sm rounded ${fleetViewMode === 'TRUCKS' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Fahrzeuge</button>
                              <button onClick={() => setFleetViewMode('TRAILERS')} className={`px-3 py-1 text-sm rounded ${fleetViewMode === 'TRAILERS' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Lose Anhänger</button>
                          </div>
                      </div>
                      
                      <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                      {fleetViewMode === 'TRUCKS' && trucks.map(truck => {
                          const model = TRUCK_MODELS.find(m => m.id === truck.modelId);
                          const estRepair = Math.floor((100 - truck.condition) * 150 + (truck.status === 'BROKEN' ? REPAIR_COST_BASE * 2 : 0));
                          
                          // Available trailers for this truck (if compatible)
                          // Logic: Cars/Vans -> Light Trailers. Heavy Trucks -> Heavy Trailers.
                          const isLight = model?.type === TruckType.CAR || model?.type === TruckType.SMALL;
                          const availableTrailers = trailers.filter(tr => {
                              const tm = SHOP_TRAILERS.find(m => m.id === tr.modelId);
                              if (!tm) return false;
                              const compatibleWeight = isLight ? tm.weightClass === 'LIGHT' : tm.weightClass === 'HEAVY';
                              return tr.locationId === truck.locationId && (!tr.isAttachedTo || tr.isAttachedTo === truck.id) && compatibleWeight;
                          });

                          return (
                              <div key={truck.id} className={`p-4 rounded-lg border flex justify-between items-start ${t.card} ${t.border}`}>
                                  {/* ICON */}
                                  <div className="w-24 h-24 flex-shrink-0 flex flex-col gap-2 items-center justify-center bg-black/20 rounded mr-4 border border-gray-600">
                                      {model && renderTruckIcon(model.type, 48)}
                                      {truck.assignedTrailerId && (
                                          <div className="flex gap-1">
                                              <div className="text-[10px] bg-blue-600 px-1 rounded text-white flex gap-1 items-center"><LinkIcon size={10}/> Trailer</div>
                                              {/* Sell Attached Trailer Button */}
                                              {truck.status === 'IDLE' && (
                                                  <button 
                                                    onClick={() => sellTrailer(trailers.find(tr => tr.id === truck.assignedTrailerId)!)} 
                                                    className="text-[10px] bg-red-600 px-1 rounded text-white hover:bg-red-500" title="Trailer Verkaufen"
                                                  >
                                                      <Trash2 size={10}/>
                                                  </button>
                                              )}
                                          </div>
                                      )}
                                  </div>
                                  
                                  <div className="flex-1">
                                      <div className="font-bold text-lg flex items-center gap-2">
                                          {model?.name} 
                                          <span className={`text-xs px-2 rounded ${t.bg}`}>{truck.status}</span>
                                      </div>
                                      <div className={`text-sm ${t.textMuted}`}>Standort: {getCityById(truck.locationId)?.name}</div>
                                      <div className={`text-xs mt-1 ${t.textMuted}`}>Kapazität: {getTruckCapacity(truck)}t {truck.assignedTrailerId ? '(mit Hänger)' : ''}</div>
                                      
                                      <div className="mt-2 text-[10px] space-y-1">
                                          <div className="flex justify-between w-32"><span>Tank</span><span>{Math.round(truck.currentFuel)}/{truck.maxFuel}</span></div>
                                          <div className={`h-1 rounded-full bg-gray-600`}><div style={{width: `${(truck.currentFuel/truck.maxFuel)*100}%`}} className="h-full bg-blue-500 rounded-full"></div></div>
                                      </div>
                                      
                                      {/* TRAILER MANAGEMENT */}
                                      {truck.status === 'IDLE' && (
                                          <div className="mt-3 flex items-center gap-2">
                                              <select 
                                                className={`text-xs p-1 rounded border ${t.input}`}
                                                value={truck.assignedTrailerId || ""}
                                                onChange={(e) => toggleTrailerAttachment(truck.id, e.target.value || undefined)}
                                              >
                                                  <option value="">Kein Anhänger</option>
                                                  {availableTrailers.map(tr => {
                                                      const tm = SHOP_TRAILERS.find(m => m.id === tr.modelId);
                                                      return <option key={tr.id} value={tr.id}>{tm?.name} ({tm?.type})</option>
                                                  })}
                                              </select>
                                          </div>
                                      )}
                                  </div>
                                  <div className="flex flex-col gap-2 ml-4">
                                      {truck.status === 'IDLE' && <button onClick={() => refuelTruck(truck)} className="text-xs bg-yellow-600 px-3 py-1 rounded text-black font-bold">Tanken</button>}
                                      {truck.status === 'IDLE' && <button onClick={() => { setSelectedTruckId(truck.id); setView('MAP'); }} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Verlegen</button>}
                                      {truck.status !== 'MOVING' && estRepair > 0 && <button onClick={() => repairTruck(truck)} className="text-xs bg-orange-700 text-white px-3 py-1 rounded">Reparatur (~{estRepair}€)</button>}
                                      {truck.status !== 'MOVING' && <button onClick={() => sellTruck(truck)} className="text-xs border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white">Verkaufen</button>}
                                  </div>
                              </div>
                          )
                      })}
                      {fleetViewMode === 'TRUCKS' && trucks.length === 0 && <div className="text-center italic opacity-50 py-10">Keine Fahrzeuge im Besitz.</div>}

                      {/* TRAILER LIST VIEW */}
                      {fleetViewMode === 'TRAILERS' && trailers.filter(t => !t.isAttachedTo).map(tr => {
                          const tm = SHOP_TRAILERS.find(m => m.id === tr.modelId);
                          return (
                              <div key={tr.id} className={`p-4 rounded-lg border flex justify-between items-center ${t.card} ${t.border}`}>
                                  <div>
                                      <div className="font-bold">{tm?.name} <span className="text-xs font-normal opacity-50">({Math.round(tr.condition)}% Zustand)</span></div>
                                      <div className="text-xs opacity-70">Standort: {getCityById(tr.locationId)?.name} | Typ: {tm?.type}</div>
                                  </div>
                                  <button onClick={() => sellTrailer(tr)} className="text-xs border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white">Verkaufen</button>
                              </div>
                          )
                      })}
                      {fleetViewMode === 'TRAILERS' && trailers.filter(t => !t.isAttachedTo).length === 0 && <div className="text-center italic opacity-50 py-10">Keine losen Anhänger.</div>}
                      </div>
                  </div>

                  {/* RIGHT: DEALER & FILTERS */}
                  <div className={`w-96 flex flex-col gap-4`}>
                      {/* FILTER PANEL */}
                      <div className={`p-4 rounded-xl border ${t.card} ${t.border}`}>
                          <h3 className="font-bold flex items-center gap-2 mb-3"><Filter size={16}/> Händler Filter</h3>
                          <div className="space-y-3 text-sm">
                              <div>
                                  <label className="block text-xs mb-1 opacity-70">Max Preis: {dealerFilter.maxPrice.toLocaleString()}€</label>
                                  <input type="range" min="10000" max="300000" step="5000" className="w-full" value={dealerFilter.maxPrice} onChange={(e) => setDealerFilter(p => ({...p, maxPrice: parseInt(e.target.value)}))} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  {Object.values(TruckType).map(type => (
                                      <label key={type} className="flex items-center gap-2 text-xs">
                                          <input 
                                            type="checkbox" 
                                            checked={dealerFilter.types[type] !== false} 
                                            onChange={() => setDealerFilter(p => ({...p, types: {...p.types, [type]: !p.types[type]}}))}
                                          />
                                          {type}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* DEALER LIST */}
                      <div className={`p-4 rounded-xl border flex-1 flex flex-col ${t.card} ${t.border}`}>
                          <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-700">
                            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Shop</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setShopTab('VEHICLES')} className={`px-2 py-1 text-xs rounded ${shopTab === 'VEHICLES' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Fahrzeuge</button>
                                <button onClick={() => setShopTab('TRAILERS')} className={`px-2 py-1 text-xs rounded ${shopTab === 'TRAILERS' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Anhänger</button>
                            </div>
                          </div>

                          <div className={`mb-4 p-2 rounded border ${t.bg} ${t.border}`}>
                              <label className={`block text-xs mb-1 ${t.textMuted}`}>Lieferung an:</label>
                              <select className={`w-full rounded p-2 text-sm ${t.input}`} value={deliveryGarageId} onChange={(e) => setDeliveryGarageId(e.target.value)}>
                                  {company.ownedGarages.map(gId => <option key={gId} value={gId}>{getCityById(gId)?.name}</option>)}
                              </select>
                          </div>

                          <div className="space-y-4 overflow-y-auto flex-1">
                              {shopTab === 'VEHICLES' && (
                                  <>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setShopVehicleSubTab('NEW')} className={`flex-1 text-center py-1 text-xs rounded ${shopVehicleSubTab === 'NEW' ? 'bg-green-600/20 text-green-400 border border-green-600' : 'bg-gray-700 opacity-50'}`}>Neuwagen</button>
                                        <button onClick={() => setShopVehicleSubTab('USED')} className={`flex-1 text-center py-1 text-xs rounded ${shopVehicleSubTab === 'USED' ? 'bg-orange-600/20 text-orange-400 border border-orange-600' : 'bg-gray-700 opacity-50'}`}>Gebrauchtwagen</button>
                                    </div>
                                    
                                    {TRUCK_MODELS
                                        .filter(m => dealerFilter.types[m.type] !== false && m.priceNew <= dealerFilter.maxPrice)
                                        .map(m => {
                                            const isUsed = shopVehicleSubTab === 'USED';
                                            const displayPrice = isUsed ? m.priceNew * 0.7 : m.priceNew;
                                            return (
                                              <div key={m.id} className={`p-3 rounded border ${t.panel} ${t.border}`}>
                                                  <div className="flex justify-between items-start">
                                                      <div>
                                                          <h3 className="font-bold text-sm">{m.name}</h3>
                                                          <div className={`text-[10px] ${t.textMuted}`}>{m.type} | {m.speed} km/h</div>
                                                      </div>
                                                      <div className="font-bold text-green-500">{displayPrice.toLocaleString()}€</div>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-1 text-[10px] my-2 opacity-70">
                                                      <div>Last: {m.capacity}t</div>
                                                      <div>PS: {m.enginePower}</div>
                                                  </div>
                                                  <button 
                                                    onClick={() => buyTruck(m, isUsed ? TruckCondition.USED_GOOD : TruckCondition.NEW)}
                                                    className={`w-full py-1 rounded text-xs font-bold ${isUsed ? 'bg-orange-700 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                                                  >
                                                      Kaufen
                                                  </button>
                                              </div>
                                          )})}
                                  </>
                              )}

                              {shopTab === 'TRAILERS' && (
                                  <>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setShopTrailerSubTab('NEW')} className={`flex-1 text-center py-1 text-xs rounded ${shopTrailerSubTab === 'NEW' ? 'bg-green-600/20 text-green-400 border border-green-600' : 'bg-gray-700 opacity-50'}`}>Neu</button>
                                        <button onClick={() => setShopTrailerSubTab('USED')} className={`flex-1 text-center py-1 text-xs rounded ${shopTrailerSubTab === 'USED' ? 'bg-orange-600/20 text-orange-400 border border-orange-600' : 'bg-gray-700 opacity-50'}`}>Gebraucht</button>
                                    </div>
                                    <div className="text-[10px] italic mb-2 opacity-60">Leicht = PKW/Sprinter | Schwer = Sattelzug</div>
                                    {SHOP_TRAILERS.map(tr => {
                                        const isUsed = shopTrailerSubTab === 'USED';
                                        const displayPrice = isUsed ? Math.floor(tr.price * 0.6) : tr.price;
                                        return (
                                        <div key={tr.id} className={`p-3 rounded border flex flex-col gap-2 ${t.panel} ${t.border}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">{tr.name}</span>
                                                <span className="text-green-500 font-bold">{displayPrice.toLocaleString()}€</span>
                                            </div>
                                            <div className="text-xs opacity-70 flex justify-between">
                                                <span>Kapazität: {tr.capacity}t</span>
                                                <span>Typ: {tr.type}</span>
                                            </div>
                                            <button 
                                                onClick={() => buyTrailer(tr, isUsed)} 
                                                className={`w-full py-1 rounded text-xs font-bold text-white ${isUsed ? 'bg-orange-700 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                                            >
                                                Kaufen
                                            </button>
                                        </div>
                                    )})}
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {view === 'GARAGE' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                   <div className={`p-6 rounded-xl border ${t.card} ${t.border}`}>
                       <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Building2 /> Niederlassungen</h2>
                       <div className="space-y-2 mb-4">
                           {company.ownedGarages.map(id => (
                               <div key={id} className={`p-3 rounded flex justify-between items-center border ${t.bg} ${t.border}`}>
                                   <div><div className="font-bold">{getCityById(id)?.name}</div></div>
                                   <div className="text-sm font-bold">
                                       {trucks.filter(t => t.locationId === id).length} LKW | 
                                       {trailers.filter(t => t.locationId === id && !t.isAttachedTo).length} Hänger
                                   </div>
                               </div>
                           ))}
                       </div>
                       <div className={`p-4 rounded border mt-6 ${t.bg} ${t.border}`}>
                           <h3 className="font-bold mb-2">Expansion</h3>
                           <div className="flex gap-2">
                               <select className={`flex-1 border rounded text-sm px-2 ${t.input}`} value={garageBuySelection} onChange={(e) => setGarageBuySelection(e.target.value)}>
                                   <option value="">Stadt wählen...</option>
                                   {CITIES.filter(c => !company.ownedGarages.includes(c.id)).sort((a,b)=>a.name.localeCompare(b.name)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                               <button onClick={() => garageBuySelection && buyGarage(garageBuySelection)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm font-bold">Kaufen</button>
                           </div>
                       </div>
                   </div>
                   
                   <div className={`p-6 rounded-xl border ${t.card} ${t.border}`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Wrench /> Werkstatt & Upgrades</h2>
                        <div className={`p-4 rounded mb-4 ${t.bg} ${t.border}`}>
                           <h3 className="font-bold mb-2">Werkstatt Level {company.garageLevel}</h3>
                           <p className={`text-sm mb-4 ${t.textMuted}`}>Höhere Level reduzieren Wartungskosten.</p>
                           <button onClick={() => {
                                 const cost = company.garageLevel * 100000;
                                 if(company.money >= cost) {
                                     setCompany(c => ({...c, money: c.money - cost, garageLevel: c.garageLevel + 1}));
                                     addEvent({id: `upg-${Date.now()}`, title: 'Ausbau fertig', message: `Garage auf Level ${company.garageLevel + 1} ausgebaut.`, type: 'SUCCESS', date: day});
                                 } else { alert("Nicht genug Geld!"); }
                             }} className="bg-yellow-600 hover:bg-yellow-500 w-full py-2 rounded text-black font-bold">
                               Upgrade für {(company.garageLevel * 100000).toLocaleString()}€
                           </button>
                        </div>
                        
                        <div className={`p-4 rounded ${t.bg} ${t.border}`}>
                             <h3 className="font-bold mb-2">Bank</h3>
                             <p className={`text-sm mb-2 ${t.textMuted}`}>Kredit zurückzahlen ({company.loan.toLocaleString()} € offen).</p>
                             <div className="flex gap-2">
                                 <button onClick={() => {
                                      if(company.money >= 50000) {
                                          setCompany(c => ({...c, money: c.money - 50000, loan: Math.max(0, c.loan - 50000)}));
                                      }
                                  }} className={`flex-1 hover:opacity-80 py-1 rounded ${t.card} border ${t.border}`}>50k zurückzahlen</button>
                             </div>
                        </div>
                   </div>
              </div>
          )}
          
          {view === 'HR' && (
              <div className={`p-6 rounded-xl border flex-1 h-full flex flex-col ${t.card} ${t.border}`}>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2"><Users /> Personal & HR</h2>
                      
                      <div className="flex items-center gap-2">
                          <Filter size={16} className={t.textMuted}/>
                          <select 
                            className={`text-sm rounded p-1 border ${t.input}`}
                            value={hrLocationFilter}
                            onChange={(e) => setHrLocationFilter(e.target.value)}
                          >
                              <option value="all">Alle Standorte</option>
                              <option value="unassigned">Ohne Fahrzeug</option>
                              {company.ownedGarages.map(gId => (
                                  <option key={gId} value={gId}>{getCityById(gId)?.name}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  
                  <h3 className={`font-bold mb-2 border-b ${t.border} ${t.textMuted} pb-2`}>Angestellte ({drivers.length})</h3>
                  <div className="space-y-2 mb-6 overflow-y-auto max-h-[40%] flex-1 pr-2">
                      {drivers.length === 0 && <div className={`italic ${t.textMuted}`}>Keine Fahrer angestellt.</div>}
                      {drivers
                        .filter(d => {
                            if (hrLocationFilter === 'all') return true;
                            if (hrLocationFilter === 'unassigned') return !d.assignedTruckId;
                            const assignedTruck = trucks.find(t => t.id === d.assignedTruckId);
                            return assignedTruck && assignedTruck.locationId === hrLocationFilter;
                        })
                        .map(d => {
                          const currentTruck = trucks.find(t => t.id === d.assignedTruckId);
                          const availableTrucks = trucks.filter(t => 
                              (!t.driverId || t.driverId === d.id) && t.status === 'IDLE' 
                          );

                          return (
                          <div key={d.id} className={`p-2 rounded flex flex-col gap-2 border ${t.bg} ${t.border}`}>
                              <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                      <div className="p-1 bg-slate-700 rounded-full text-slate-300"><User size={14}/></div>
                                      <div>
                                          <div className="font-bold flex items-center gap-2">
                                              {d.name} 
                                              <span className="text-xs opacity-50">Lvl {Math.floor(d.skill)}</span>
                                              {d.firingDate && <span className="text-xs bg-red-900 text-red-200 px-2 rounded">Kündigung in {d.firingDate - day} Tagen</span>}
                                          </div>
                                          <div className={`text-xs ${t.textMuted}`}>Gehalt: {d.salary}€</div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-end">
                                      <select 
                                        className={`text-xs p-1 rounded border max-w-[150px] ${t.input}`}
                                        value={d.assignedTruckId || ""}
                                        onChange={(e) => assignDriverToTruck(d.id, e.target.value)}
                                        disabled={!!d.firingDate}
                                      >
                                          <option value="">Kein Fahrzeug</option>
                                          {availableTrucks.map(truck => {
                                              const m = TRUCK_MODELS.find(mod => mod.id === truck.modelId);
                                              const loc = getCityById(truck.locationId);
                                              return <option key={truck.id} value={truck.id}>{m?.name} ({loc?.name})</option>
                                          })}
                                          {currentTruck && currentTruck.status !== 'IDLE' && (
                                              <option value={currentTruck.id} disabled>{TRUCK_MODELS.find(m=>m.id===currentTruck.modelId)?.name} (Unterwegs)</option>
                                          )}
                                      </select>
                                  </div>
                              </div>

                              <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-700/30">
                                  <div className="text-[10px] text-gray-500">
                                      {d.assignedTruckId ? <span className={t.success}>Im Dienst</span> : <span className={t.danger}>Wartet auf Zuweisung</span>}
                                  </div>
                                  <div className="flex gap-2">
                                      {d.skill < 10 && !d.firingDate && <button onClick={() => trainDriver(d.id)} className="text-[10px] bg-indigo-900 text-white px-2 rounded hover:bg-indigo-800">Schulung (5.000€)</button>}
                                      {!d.firingDate && <button onClick={() => fireDriver(d.id)} className="text-[10px] bg-red-900/50 text-red-400 px-2 rounded border border-red-900 hover:bg-red-900 hover:text-white">Kündigen</button>}
                                  </div>
                              </div>
                          </div>
                      )})}
                  </div>

                  <div className={`rounded border flex-1 flex flex-col overflow-hidden ${t.bg} ${t.border}`}>
                      <h3 className={`font-bold p-3 ${t.accent} bg-black/10`}>Bewerber</h3>
                      <div className="overflow-y-auto flex-1 p-2">
                          <table className="w-full text-sm text-left">
                              <thead><tr className={t.textMuted}><th className="p-1">Name</th><th>Skill</th><th>Lohn</th><th></th></tr></thead>
                              <tbody>
                                  {recruits.map(r => (
                                      <tr key={r.id} className="border-b border-gray-700/50">
                                          <td className="p-1 flex items-center gap-1"><UserPlus size={12}/> {r.name}</td>
                                          <td className="text-yellow-500">{r.skill.toFixed(1)}</td>
                                          <td>{r.salary}€</td>
                                          <td className="text-right"><button onClick={() => hireSpecificDriver(r)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Einstellen (1k)</button></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;