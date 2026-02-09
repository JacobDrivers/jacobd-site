import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, DollarSign, AlertTriangle, Check, X, ChevronRight } from 'lucide-react';

// Coin type data with key info
const COIN_TYPES = [
  {
    id: 'morgan',
    name: 'Morgan Dollar',
    years: '1878-1921',
    composition: '90% Silver',
    asw: 0.77344,
    keyDates: ['1893-S', '1895', '1889-CC', '1892-S', '1893-O'],
    varieties: ['1888-O Hot Lips', '1900-O/CC'],
    gradeHotspots: ['Hair above ear', 'Eagle breast feathers', 'Cheek detail'],
    dangers: ['Cleaned examples common', 'Counterfeits of key dates', 'Whizzing'],
    premiumRange: '20-200% over melt for common dates'
  },
  {
    id: 'peace',
    name: 'Peace Dollar',
    years: '1921-1935',
    composition: '90% Silver',
    asw: 0.77344,
    keyDates: ['1928', '1934-S', '1921'],
    varieties: ['High relief 1921', '1922 No D', '1934-D doubled die'],
    gradeHotspots: ['Hair over ear', 'Eagle feathers on wing'],
    dangers: ['Weak strikes common', 'Cleaned examples'],
    premiumRange: '15-150% over melt'
  },
  {
    id: 'walking-half',
    name: 'Walking Liberty Half',
    years: '1916-1947',
    composition: '90% Silver',
    asw: 0.36169,
    keyDates: ['1921', '1921-D', '1921-S', '1938-D'],
    varieties: ['1936 doubled die', '1943 doubled die reverse'],
    gradeHotspots: ['Left hand detail', 'Skirt lines', 'Head definition'],
    dangers: ['Often weakly struck', 'Cleaning common'],
    premiumRange: '10-100% over melt'
  },
  {
    id: 'franklin-half',
    name: 'Franklin Half',
    years: '1948-1963',
    composition: '90% Silver',
    asw: 0.36169,
    keyDates: ['1949-S', '1953', '1955'],
    varieties: ['FBL (Full Bell Lines) premium'],
    gradeHotspots: ['Liberty Bell lines', 'Hair detail'],
    dangers: ['Weak strikes on bell', 'Toning vs. artificial color'],
    premiumRange: '5-50% over melt (FBL much higher)'
  },
  {
    id: 'kennedy-90',
    name: 'Kennedy Half (90%)',
    years: '1964',
    composition: '90% Silver',
    asw: 0.36169,
    keyDates: ['1964 proof', '1964-D'],
    varieties: ['Accented hair'],
    gradeHotspots: ['Hair detail'],
    dangers: ['Common, mostly melt value'],
    premiumRange: '0-10% over melt'
  },
  {
    id: 'kennedy-40',
    name: 'Kennedy Half (40%)',
    years: '1965-1970',
    composition: '40% Silver',
    asw: 0.14792,
    keyDates: ['1970-D'],
    varieties: [],
    gradeHotspots: ['Usually melt value'],
    dangers: ['Lower silver content', 'Mostly circulated'],
    premiumRange: '0-5% over melt'
  },
  {
    id: 'washington-quarter',
    name: 'Washington Quarter',
    years: '1932-1964',
    composition: '90% Silver',
    asw: 0.18084,
    keyDates: ['1932-D', '1932-S'],
    varieties: ['1950-D/S overmintmark'],
    gradeHotspots: ['Hair detail', 'Eagle breast'],
    dangers: ['Common dates near melt', 'Cleaning'],
    premiumRange: '0-50% over melt (except keys)'
  },
  {
    id: 'mercury-dime',
    name: 'Mercury Dime',
    years: '1916-1945',
    composition: '90% Silver',
    asw: 0.07234,
    keyDates: ['1916-D', '1921', '1921-D', '1942/1', '1942/1-D'],
    varieties: ['Full bands (FB) premium'],
    gradeHotspots: ['Fasces bands', 'Hair detail'],
    dangers: ['Weak strikes common', 'Counterfeits of 1916-D'],
    premiumRange: '5-100% over melt (FB higher)'
  },
  {
    id: 'war-nickel',
    name: 'War Nickel',
    years: '1942-1945',
    composition: '35% Silver',
    asw: 0.05626,
    keyDates: ['Large mintmark above Monticello'],
    varieties: [],
    gradeHotspots: ['Check for large mintmark'],
    dangers: ['Only silver if large mintmark', 'Low value'],
    premiumRange: '0-10% over melt'
  }
];

const CURRENCY_TYPES = [
  {
    id: 'silver-cert',
    name: 'Silver Certificate',
    years: '1878-1964',
    identifier: 'Blue seal, "Silver Certificate" text',
    keyFeatures: ['Star notes premium', 'Low serial numbers', 'Fancy serials'],
    varieties: ['1899 Black Eagle', '1923 Porthole', '1934 FRN look-alike'],
    dangers: ['Condition critical', 'Folds/tears kill value', 'Bleaching/restoration'],
    valueFactors: ['Series', 'Condition', 'Serial number', 'Signature combo']
  },
  {
    id: 'red-seal',
    name: 'US Note (Red Seal)',
    years: '1862-1966',
    identifier: 'Red seal, "United States Note"',
    keyFeatures: ['Star notes', 'Low numbers', 'Fancy serials'],
    varieties: ['1928-1966 small size', 'Earlier large size'],
    dangers: ['Condition matters most', 'Common dates near face'],
    valueFactors: ['Series', 'Denomination', 'Condition', 'Serial']
  },
  {
    id: 'frn',
    name: 'Federal Reserve Note',
    years: '1914-present',
    identifier: 'Green seal (modern), "Federal Reserve Note"',
    keyFeatures: ['Star notes', 'Fancy serials', 'Errors'],
    varieties: ['Low serial numbers', 'Radar/repeater serials', 'Solid numbers'],
    dangers: ['Modern = face value unless special', 'Errors need verification'],
    valueFactors: ['Errors', 'Serial number patterns', 'Star replacement']
  }
];

export default function CoinScout() {
  const [spotPrices, setSpotPrices] = useState({ silver: 31.5, gold: 2750, updated: null });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('dashboard');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [flipped, setFlipped] = useState({});

  // Load inventory from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('coinInventory');
    if (saved) {
      setInventory(JSON.parse(saved));
    }
  }, []);

  // Save inventory to localStorage
  useEffect(() => {
    localStorage.setItem('coinInventory', JSON.stringify(inventory));
  }, [inventory]);

  // Fetch spot prices via API route
  const fetchSpotPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/metals.json');
      const data = await response.json();
      
      const silver = parseFloat(data.silver);
      const gold = parseFloat(data.gold);
      
      if (!isNaN(silver) && !isNaN(gold) && silver > 0 && gold > 0) {
        const source = data.source ? ` (${data.source})` : '';
        const staleIndicator = data.stale ? ' [CACHED]' : '';
        const errorIndicator = data.error ? ` - Warning: ${data.error}` : '';
        
        setSpotPrices({
          silver,
          gold,
          updated: new Date().toLocaleTimeString() + source + staleIndicator + errorIndicator
        });
      } else {
        // Use fallback values if parsing fails
        setSpotPrices({
          silver: 31.5,
          gold: 2750,
          updated: 'Error loading prices - using fallback'
        });
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setSpotPrices(prev => ({ ...prev, updated: 'Error - see console' }));
    }
    setLoading(false);
  };

  // Fetch spot prices on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadPrices = async () => {
      await fetchSpotPrices();
    };
    
    loadPrices();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate melt value
  const calculateMelt = (asw, quantity = 1) => {
    return (asw * spotPrices.silver * quantity).toFixed(2);
  };

  // Add to inventory
  const addToInventory = (item) => {
    setInventory([...inventory, { ...item, id: Date.now() }]);
  };

  // Delete from inventory
  const deleteFromInventory = (itemId) => {
    setInventory(inventory.filter(item => item.id !== itemId));
  };

  // Auction mode calculator
  const [auctionCalc, setAuctionCalc] = useState({
    type: null,
    quantity: 1,
    premium: 10,
    maxBid: 0
  });

  useEffect(() => {
    if (auctionCalc.type) {
      const coinData = COIN_TYPES.find(c => c.id === auctionCalc.type);
      if (coinData) {
        const melt = parseFloat(calculateMelt(coinData.asw, auctionCalc.quantity));
        const withPremium = melt * (1 + auctionCalc.premium / 100);
        setAuctionCalc(prev => ({ ...prev, maxBid: withPremium.toFixed(2) }));
      }
    }
  }, [auctionCalc.type, auctionCalc.quantity, auctionCalc.premium, spotPrices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Coin & Currency Scout
              </h1>
              <p className="text-slate-400 mt-1">Live spot prices • Key dates • Melt calculator</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400">Silver</div>
                  <div className="text-2xl font-bold text-slate-200">${spotPrices.silver.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Gold</div>
                  <div className="text-2xl font-bold text-yellow-400">${spotPrices.gold.toFixed(0)}</div>
                </div>
                <button
                  onClick={fetchSpotPrices}
                  disabled={loading}
                  className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-1">Updated: {spotPrices.updated || 'Click refresh'}</div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
            { id: 'coins', label: 'Coin Library', icon: Search },
            { id: 'currency', label: 'Paper Currency', icon: DollarSign },
            { id: 'inventory', label: 'My Inventory', icon: Plus },
            { id: 'auction', label: 'Auction Mode', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                  view === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Quick Melt Calculator</h2>
                <QuickMeltCalc spotPrices={spotPrices} />
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Inventory Summary</h2>
                <InventorySummary inventory={inventory} spotPrices={spotPrices} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Quick ID Guide</h2>
              <QuickIDGuide />
            </div>
          </div>
        )}

        {/* Coin Library View */}
        {view === 'coins' && (
          <div className="space-y-6">
            {selectedCoin ? (
              <CoinDetail
                coin={selectedCoin}
                onBack={() => setSelectedCoin(null)}
                spotPrice={spotPrices.silver}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COIN_TYPES.map(coin => (
                  <CoinCard
                    key={coin.id}
                    coin={coin}
                    onClick={() => setSelectedCoin(coin)}
                    spotPrice={spotPrices.silver}
                    flipped={flipped[coin.id]}
                    onFlip={() => setFlipped(prev => ({ ...prev, [coin.id]: !prev[coin.id] }))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Currency Library View */}
        {view === 'currency' && (
          <div className="space-y-6">
            {selectedCurrency ? (
              <CurrencyDetail
                currency={selectedCurrency}
                onBack={() => setSelectedCurrency(null)}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CURRENCY_TYPES.map(currency => (
                  <CurrencyCard
                    key={currency.id}
                    currency={currency}
                    onClick={() => setSelectedCurrency(currency)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory View */}
        {view === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onAdd={addToInventory}
            onDelete={deleteFromInventory}
            spotPrices={spotPrices}
            coinTypes={COIN_TYPES}
          />
        )}

        {/* Auction Mode View */}
        {view === 'auction' && (
          <AuctionMode
            coinTypes={COIN_TYPES}
            spotPrice={spotPrices.silver}
            auctionCalc={auctionCalc}
            setAuctionCalc={setAuctionCalc}
          />
        )}
      </div>
    </div>
  );
}

// Quick Melt Calculator Component
function QuickMeltCalc({ spotPrices }) {
  const [calc, setCalc] = useState({ type: 'dime-90', quantity: 1 });
  
  const types = {
    'dime-90': { name: '90% Dimes', asw: 0.07234 },
    'quarter-90': { name: '90% Quarters', asw: 0.18084 },
    'half-90': { name: '90% Halves', asw: 0.36169 },
    'half-40': { name: '40% Halves', asw: 0.14792 },
    'dollar-90': { name: '90% Dollars', asw: 0.77344 },
    'war-nickel': { name: 'War Nickels', asw: 0.05626 }
  };

  const melt = (types[calc.type].asw * spotPrices.silver * calc.quantity).toFixed(2);

  return (
    <div className="space-y-4">
      <select
        value={calc.type}
        onChange={e => setCalc({ ...calc, type: e.target.value })}
        className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 text-white"
      >
        {Object.entries(types).map(([key, val]) => (
          <option key={key} value={key}>{val.name}</option>
        ))}
      </select>
      
      <input
        type="number"
        min="1"
        value={calc.quantity}
        onChange={e => setCalc({ ...calc, quantity: parseInt(e.target.value) || 1 })}
        className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 text-white"
        placeholder="Quantity"
      />
      
      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="text-sm text-slate-400">Melt Value</div>
        <div className="text-3xl font-bold text-green-400">${melt}</div>
        <div className="text-xs text-slate-500 mt-1">
          {calc.quantity} × {types[calc.type].asw.toFixed(5)} oz × ${spotPrices.silver.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// Inventory Summary Component
function InventorySummary({ inventory, spotPrices }) {
  const totalMelt = inventory.reduce((sum, item) => {
    const coinData = COIN_TYPES.find(c => c.id === item.type);
    if (coinData) {
      return sum + (coinData.asw * spotPrices.silver * (item.quantity || 1));
    }
    return sum;
  }, 0);

  const totalPaid = inventory.reduce((sum, item) => sum + (parseFloat(item.paid) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="text-sm text-slate-400">Total Items</div>
        <div className="text-2xl font-bold">{inventory.length}</div>
      </div>
      
      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="text-sm text-slate-400">Total Melt Value</div>
        <div className="text-2xl font-bold text-green-400">${totalMelt.toFixed(2)}</div>
      </div>
      
      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="text-sm text-slate-400">Total Paid</div>
        <div className="text-2xl font-bold text-blue-400">${totalPaid.toFixed(2)}</div>
      </div>
      
      {totalPaid > 0 && (
        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="text-sm text-slate-400">Profit/Loss vs Melt</div>
          <div className={`text-2xl font-bold ${totalMelt >= totalPaid ? 'text-green-400' : 'text-red-400'}`}>
            ${(totalMelt - totalPaid).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick ID Guide
function QuickIDGuide() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="font-bold text-amber-400 flex items-center gap-2">
          <Check className="w-4 h-4" /> Quick Winners
        </h3>
        <ul className="text-sm space-y-1 text-slate-300">
          <li>• Pre-1965 dimes/quarters/halves = 90% silver</li>
          <li>• 1965-1970 Kennedy halves = 40% silver</li>
          <li>• 1942-1945 nickels (large mintmark) = 35% silver</li>
          <li>• Morgan/Peace dollars = premium candidates</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-bold text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" /> Red Flags
        </h3>
        <ul className="text-sm space-y-1 text-slate-300">
          <li>• Bright "chrome" shine = cleaned</li>
          <li>• Sparkly flow lines = whizzing</li>
          <li>• Green/greasy film = PVC damage</li>
          <li>• Rim dents, deep scratches = problem coins</li>
        </ul>
      </div>
    </div>
  );
}

// Coin Card Component
function CoinCard({ coin, onClick, spotPrice }) {
  const melt = (coin.asw * spotPrice).toFixed(2);

  return (
    <div 
      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-amber-600 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors">{coin.name}</h3>
            <p className="text-sm text-slate-400">{coin.years}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Composition</span>
            <span className="font-mono">{coin.composition}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">ASW</span>
            <span className="font-mono">{coin.asw} oz</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Melt Value</span>
            <span className="font-bold text-green-400">${melt}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500">Key Dates: {coin.keyDates.slice(0, 3).join(', ')}</div>
        </div>
      </div>
    </div>
  );
}

// Coin Detail Component
function CoinDetail({ coin, onBack, spotPrice }) {
  const melt = (coin.asw * spotPrice).toFixed(2);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
      >
        ← Back to Library
      </button>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{coin.name}</h2>
            <p className="text-slate-400 text-lg mb-6">{coin.years}</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-sm text-slate-400">Melt Value (Current)</div>
                <div className="text-2xl font-bold text-green-400">${melt}</div>
                <div className="text-xs text-slate-500">{coin.asw} oz × ${spotPrice.toFixed(2)}</div>
              </div>
              
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-sm text-slate-400">Typical Premium Range</div>
                <div className="text-lg font-bold text-amber-400">{coin.premiumRange}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Key Dates to Look For
              </h3>
              <div className="space-y-1">
                {coin.keyDates.map(date => (
                  <div key={date} className="p-2 bg-slate-700 rounded text-sm font-mono">
                    {date}
                  </div>
                ))}
              </div>
            </div>

            {coin.varieties.length > 0 && (
              <div>
                <h3 className="font-bold text-blue-400 mb-3">Notable Varieties</h3>
                <div className="space-y-1">
                  {coin.varieties.map((variety, i) => (
                    <div key={i} className="p-2 bg-slate-700 rounded text-sm">
                      {variety}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-green-400 mb-3">Grade Hot Spots</h3>
              <ul className="text-sm space-y-1">
                {coin.gradeHotspots.map((spot, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>{spot}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-red-400 mb-3">Danger Signs</h3>
              <ul className="text-sm space-y-1">
                {coin.dangers.map((danger, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                    <span>{danger}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Currency Card Component
function CurrencyCard({ currency, onClick }) {
  return (
    <div 
      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-green-600 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">{currency.name}</h3>
            <p className="text-sm text-slate-400">{currency.years}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-green-400 transition-colors" />
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">Identifier</div>
            <div className="text-sm font-mono text-green-400">{currency.identifier}</div>
          </div>
          
          <div>
            <div className="text-xs text-slate-500 mb-1">Key Features</div>
            <div className="text-xs text-slate-300">{currency.keyFeatures.slice(0, 2).join(', ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Currency Detail Component
function CurrencyDetail({ currency, onBack }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
      >
        ← Back to Library
      </button>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-2">{currency.name}</h2>
        <p className="text-slate-400 text-lg mb-6">{currency.years}</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">How to Identify</div>
              <div className="font-mono text-green-400">{currency.identifier}</div>
            </div>

            <div>
              <h3 className="font-bold text-green-400 mb-3">Key Features to Check</h3>
              <ul className="space-y-2">
                {currency.keyFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-blue-400 mb-3">Notable Varieties</h3>
              <ul className="space-y-1">
                {currency.varieties.map((variety, i) => (
                  <li key={i} className="p-2 bg-slate-700 rounded text-sm">
                    {variety}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-red-400 mb-3">Condition Killers</h3>
              <ul className="space-y-2">
                {currency.dangers.map((danger, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                    <span>{danger}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-amber-400 mb-3">Value Factors</h3>
              <ul className="space-y-1">
                {currency.valueFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <DollarSign className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <div className="text-sm font-bold text-blue-400 mb-2">💡 Pro Tip</div>
              <div className="text-sm text-slate-300">
                Use a magnifying glass to check for micro-printing and serial number quality. 
                Counterfeits often have fuzzy or irregular serials.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inventory View Component
function InventoryView({ inventory, onAdd, onDelete, spotPrices, coinTypes }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'morgan',
    date: '',
    mintmark: '',
    quantity: 1,
    paid: '',
    grade: '',
    notes: ''
  });

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem({
      type: 'morgan',
      date: '',
      mintmark: '',
      quantity: 1,
      paid: '',
      grade: '',
      notes: ''
    });
    setShowAdd(false);
  };

  const handleDelete = (itemId) => {
    onDelete(itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Inventory</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-bold mb-4">Add New Item</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={newItem.type}
              onChange={e => setNewItem({ ...newItem, type: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white"
            >
              {coinTypes.map(coin => (
                <option key={coin.id} value={coin.id}>{coin.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Date (e.g., 1921)"
              value={newItem.date}
              onChange={e => setNewItem({ ...newItem, date: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500"
            />

            <input
              type="text"
              placeholder="Mintmark (e.g., S, D, CC)"
              value={newItem.mintmark}
              onChange={e => setNewItem({ ...newItem, mintmark: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500"
            />

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Amount Paid ($)"
              value={newItem.paid}
              onChange={e => setNewItem({ ...newItem, paid: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500"
            />

            <input
              type="text"
              placeholder="Grade/Condition"
              value={newItem.grade}
              onChange={e => setNewItem({ ...newItem, grade: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500"
            />

            <textarea
              placeholder="Notes"
              value={newItem.notes}
              onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
              className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-slate-500 md:col-span-2"
              rows="2"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Add to Inventory
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {inventory.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No items yet. Click "Add Item" to start tracking your collection!
          </div>
        ) : (
          inventory.map(item => {
            const coinData = coinTypes.find(c => c.id === item.type);
            const melt = coinData ? (coinData.asw * spotPrices.silver * item.quantity).toFixed(2) : '0.00';
            const paid = parseFloat(item.paid) || 0;
            const profit = parseFloat(melt) - paid;

            return (
              <div key={item.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {coinData?.name} {item.date} {item.mintmark}
                    </h3>
                    <div className="text-sm text-slate-400 mt-1">
                      Qty: {item.quantity} • Grade: {item.grade || 'Not specified'}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-slate-500 mt-1">{item.notes}</div>
                    )}
                  </div>
                  <div className="flex items-start gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Melt Value</div>
                      <div className="text-xl font-bold text-green-400">${melt}</div>
                      {paid > 0 && (
                        <div className={`text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {profit >= 0 ? '+' : ''}{profit.toFixed(2)} vs paid
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="Delete item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Auction Mode Component
function AuctionMode({ coinTypes, spotPrice, auctionCalc, setAuctionCalc }) {
  const selectedCoin = coinTypes.find(c => c.id === auctionCalc.type);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-xl p-8 border border-amber-600">
        <h2 className="text-2xl font-bold mb-6 text-amber-400">⚡ Auction Mode</h2>
        <p className="text-slate-400 mb-6">Quick bid calculator for live auctions</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Coin Type</label>
            <select
              value={auctionCalc.type || ''}
              onChange={e => setAuctionCalc({ ...auctionCalc, type: e.target.value })}
              className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 text-white text-lg"
            >
              <option value="">Select type...</option>
              {coinTypes.map(coin => (
                <option key={coin.id} value={coin.id}>{coin.name}</option>
              ))}
            </select>
          </div>

          {selectedCoin && (
            <>
              <div>
                <label className="block text-sm font-bold mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={auctionCalc.quantity}
                  onChange={e => setAuctionCalc({ ...auctionCalc, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 text-white text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Premium Over Melt (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={auctionCalc.premium}
                  onChange={e => setAuctionCalc({ ...auctionCalc, premium: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-2xl font-bold text-amber-400 mt-2">
                  {auctionCalc.premium}%
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border-2 border-green-500">
                <div className="text-sm text-green-300 mb-1">Maximum Bid</div>
                <div className="text-5xl font-bold text-white mb-2">${auctionCalc.maxBid}</div>
                <div className="text-sm text-green-300">
                  Melt: ${(selectedCoin.asw * spotPrice * auctionCalc.quantity).toFixed(2)} + {auctionCalc.premium}% premium
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400">Typical Premium</div>
                  <div className="text-sm font-bold text-amber-400">{selectedCoin.premiumRange}</div>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400">ASW Each</div>
                  <div className="text-sm font-bold">{selectedCoin.asw} oz</div>
                </div>
              </div>

              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Quick Check
                </div>
                <ul className="text-sm space-y-1">
                  {selectedCoin.dangers.slice(0, 3).map((danger, i) => (
                    <li key={i}>• {danger}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}