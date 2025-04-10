import React, { useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define weapon and apparel types for shop items
interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  price: {
    gold: number;
    spiritualStones: number;
    qi: number;
  };
  requiredLevel: number;
  icon: string;
}

// Generate random weapons
const generateWeapons = (): ShopItem[] => {
  const weaponTypes = ['sword', 'saber', 'spear', 'staff', 'dagger', 'bow', 'fan', 'whip', 'hammer', 'axe'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const weaponPrefixes = ['Dragon', 'Phoenix', 'Thunder', 'Frost', 'Azure', 'Blood', 'Heaven', 'Earth', 'Ancient', 'Divine'];
  const weaponSuffixes = ['Blade', 'Edge', 'Fang', 'Claw', 'Shard', 'Slayer', 'Bane', 'Reaper', 'Vanquisher', 'Harbinger'];
  
  const weapons: ShopItem[] = [];
  
  for (let i = 0; i < 25; i++) {
    const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = weaponPrefixes[Math.floor(Math.random() * weaponPrefixes.length)];
    const suffix = weaponSuffixes[Math.floor(Math.random() * weaponSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(3, rarityIndex);
    const basePrice = 50 * rarityMultiplier;
    const baseStatValue = 5 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['attack'] = baseStatValue + Math.floor(Math.random() * 10);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['critChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['strength'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['agility'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['intelligence'] = 1 + Math.floor(Math.random() * rarityIndex * 3);
    }
    
    // Determine if the weapon costs spiritual stones based on rarity
    let spiritualStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      spiritualStoneCost = (rarityIndex - 2) * 5;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 100;
    }
    
    weapons.push({
      id: `weapon-${i}`,
      name: `${prefix} ${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)} ${suffix}`,
      description: `A powerful ${rarity} ${weaponType} forged with mystical techniques.`,
      type: weaponType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        spiritualStones: spiritualStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 5),
      icon: weaponType === 'sword' ? 'fa-khanda' :
             weaponType === 'saber' ? 'fa-utensils' :
             weaponType === 'spear' ? 'fa-location-arrow' :
             weaponType === 'staff' ? 'fa-magic' :
             weaponType === 'dagger' ? 'fa-cut' :
             weaponType === 'bow' ? 'fa-arrow-right' :
             weaponType === 'fan' ? 'fa-hand-paper' :
             weaponType === 'whip' ? 'fa-wave-square' :
             weaponType === 'hammer' ? 'fa-hammer' :
             weaponType === 'axe' ? 'fa-axe' : 'fa-sword'
    });
  }
  
  return weapons;
};

// Generate random apparel
const generateApparel = (): ShopItem[] => {
  const apparelTypes = ['robe', 'armor', 'innerWear', 'outerWear', 'belt', 'boots', 'gloves', 'hat', 'mask', 'accessory'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const apparelPrefixes = ['Celestial', 'Mystic', 'Immortal', 'Ethereal', 'Jade', 'Golden', 'Sacred', 'Profound', 'Spiritual', 'Transcendent'];
  const apparelSuffixes = ['Garment', 'Attire', 'Vestment', 'Raiment', 'Apparel', 'Protection', 'Guard', 'Aegis', 'Mantle', 'Ward'];
  
  const apparel: ShopItem[] = [];
  
  for (let i = 0; i < 50; i++) {
    const apparelType = apparelTypes[Math.floor(Math.random() * apparelTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = apparelPrefixes[Math.floor(Math.random() * apparelPrefixes.length)];
    const suffix = apparelSuffixes[Math.floor(Math.random() * apparelSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(2.5, rarityIndex);
    const basePrice = 40 * rarityMultiplier;
    const baseStatValue = 3 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['defense'] = baseStatValue + Math.floor(Math.random() * 8);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['dodgeChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['endurance'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['perception'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['maxHealth'] = 10 + Math.floor(Math.random() * rarityIndex * 10);
    }
    
    // Determine if the apparel costs spiritual stones based on rarity
    let spiritualStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      spiritualStoneCost = (rarityIndex - 2) * 4;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 80;
    }
    
    apparel.push({
      id: `apparel-${i}`,
      name: `${prefix} ${apparelType.charAt(0).toUpperCase() + apparelType.slice(1)} ${suffix}`,
      description: `A refined ${rarity} ${apparelType} crafted with exceptional skill.`,
      type: apparelType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        spiritualStones: spiritualStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 4),
      icon: `fa-${apparelType === 'robe' ? 'tshirt' : apparelType === 'armor' ? 'shield-alt' : apparelType === 'mask' ? 'mask' : apparelType === 'boots' ? 'boot' : apparelType === 'gloves' ? 'mitten' : apparelType === 'hat' ? 'hat-wizard' : 'ring'}`
    });
  }
  
  return apparel;
};

// Generate additional apparel to reach 100 items
const generateAdditionalApparel = (): ShopItem[] => {
  const apparelTypes = ['robe', 'armor', 'innerWear', 'outerWear', 'belt', 'boots', 'gloves', 'hat', 'mask', 'accessory'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const apparelPrefixes = ['Cloud', 'Moon', 'Star', 'Sun', 'Mountain', 'River', 'Ocean', 'Lightning', 'Fire', 'Wind'];
  const apparelSuffixes = ['Shroud', 'Cover', 'Cloth', 'Wrapping', 'Veil', 'Skin', 'Shell', 'Layer', 'Drape', 'Fabric'];
  
  const apparel: ShopItem[] = [];
  
  for (let i = 0; i < 50; i++) {
    const apparelType = apparelTypes[Math.floor(Math.random() * apparelTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = apparelPrefixes[Math.floor(Math.random() * apparelPrefixes.length)];
    const suffix = apparelSuffixes[Math.floor(Math.random() * apparelSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(2.5, rarityIndex);
    const basePrice = 40 * rarityMultiplier;
    const baseStatValue = 3 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['defense'] = baseStatValue + Math.floor(Math.random() * 8);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['dodgeChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['endurance'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['perception'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['maxHealth'] = 10 + Math.floor(Math.random() * rarityIndex * 10);
    }
    
    // Determine if the apparel costs spiritual stones based on rarity
    let spiritualStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      spiritualStoneCost = (rarityIndex - 2) * 4;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 80;
    }
    
    apparel.push({
      id: `apparel-extra-${i}`,
      name: `${prefix} ${apparelType.charAt(0).toUpperCase() + apparelType.slice(1)} ${suffix}`,
      description: `An elegant ${rarity} ${apparelType} with unique properties.`,
      type: apparelType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        spiritualStones: spiritualStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 4),
      icon: `fa-${apparelType === 'robe' ? 'tshirt' : apparelType === 'armor' ? 'shield-alt' : apparelType === 'mask' ? 'mask' : apparelType === 'boots' ? 'boot' : apparelType === 'gloves' ? 'mitten' : apparelType === 'hat' ? 'hat-wizard' : 'ring'}`
    });
  }
  
  return apparel;
};

export default function Shop() {
  const { game, updateGameState } = useGameEngine();
  const [weapons] = useState<ShopItem[]>(generateWeapons());
  const [apparel] = useState<ShopItem[]>([...generateApparel(), ...generateAdditionalApparel()]);
  const [currentTab, setCurrentTab] = useState('weapons');
  
  // Add filter functionality
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  
  // Get available types based on the current tab
  const getAvailableTypes = () => {
    if (currentTab === 'weapons') {
      return ['sword', 'saber', 'spear', 'staff', 'dagger', 'bow', 'fan', 'whip', 'hammer', 'axe'];
    } else {
      return ['robe', 'armor', 'innerWear', 'outerWear', 'belt', 'boots', 'gloves', 'hat', 'mask', 'accessory'];
    }
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'mythic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const canAfford = (item: ShopItem) => {
    return game.gold >= item.price.gold &&
           game.spiritualStones >= item.price.spiritualStones &&
           game.energy >= item.price.qi;
  };
  
  const meetsLevelRequirement = (item: ShopItem) => {
    return game.cultivationLevel >= item.requiredLevel;
  };
  
  const purchaseItem = (item: ShopItem) => {
    if (!canAfford(item)) {
      toast({
        title: "Cannot afford item",
        description: "You don't have enough resources to purchase this item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!meetsLevelRequirement(item)) {
      toast({
        title: "Level too low",
        description: `You need to be at least level ${item.requiredLevel} to purchase this item.`,
        variant: "destructive"
      });
      return;
    }
    
    // Update game state to purchase the item
    updateGameState(state => {
      // Deduct costs
      const newState = {
        ...state,
        gold: state.gold - item.price.gold,
        spiritualStones: state.spiritualStones - item.price.spiritualStones,
        energy: state.energy - item.price.qi
      };
      
      // Add item to inventory based on its type
      if (item.id.startsWith('weapon')) {
        newState.inventory.weapons[item.id] = {
          id: item.id,
          name: item.name,
          type: item.type as any,
          rarity: item.rarity as any,
          level: 1,
          stats: item.stats,
          equipped: false,
          icon: item.icon,
          description: item.description,
          price: item.price,
          requiredLevel: item.requiredLevel
        };
      } else {
        newState.inventory.apparel[item.id] = {
          id: item.id,
          name: item.name,
          type: item.type as any,
          rarity: item.rarity as any,
          level: 1,
          stats: item.stats,
          equipped: false,
          icon: item.icon,
          description: item.description,
          price: item.price,
          requiredLevel: item.requiredLevel
        };
      }
      
      return newState;
    });
    
    toast({
      title: "Item Purchased",
      description: `You have purchased ${item.name}.`,
      variant: "default"
    });
  };
  
  // Helper function to render item stats
  const renderStats = (stats: Record<string, number>) => {
    return Object.entries(stats).map(([stat, value]) => (
      <div key={stat} className="text-sm">
        <span className="font-semibold capitalize">{stat}:</span> +{value}
      </div>
    ));
  };
  
  // Filter and sort items for display
  const getFilteredAndSortedItems = () => {
    let items = currentTab === 'weapons' ? weapons : apparel;
    
    // Apply rarity filter
    if (rarityFilter !== 'all') {
      items = items.filter(item => item.rarity === rarityFilter);
    }
    
    // Apply level filter
    if (levelFilter !== null) {
      items = items.filter(item => item.requiredLevel <= levelFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      items = items.filter(item => item.type === typeFilter);
    }
    
    // Apply price sorting
    if (priceSort === 'asc') {
      items = [...items].sort((a, b) => a.price.gold - b.price.gold);
    } else if (priceSort === 'desc') {
      items = [...items].sort((a, b) => b.price.gold - a.price.gold);
    }
    
    return items;
  };
  
  // Display items for the current tab
  const itemsToDisplay = getFilteredAndSortedItems();
  
  if (!game.characterCreated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Character Required</CardTitle>
            <CardDescription>
              You need to create a character before accessing the shop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please go to the Character page to create your character first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif mb-6 text-center text-primary">
        <i className="fas fa-shopping-cart mr-2"></i> Cultivation Market
      </h1>
      
      <div className="mb-6 p-4 rounded-lg bg-primary/5 flex justify-center items-center">
        <div className="flex space-x-8">
          <div>
            <span className="font-semibold text-primary">Gold:</span> 
            <span className="ml-2 text-amber-600">{game.gold}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Qi Stones:</span> 
            <span className="ml-2 text-blue-600">{game.spiritualStones}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Qi:</span> 
            <span className="ml-2 text-green-600">{Math.floor(game.energy)}</span>
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="weapons">
            <i className="fas fa-khanda mr-2"></i> Weapons
          </TabsTrigger>
          <TabsTrigger value="apparel">
            <i className="fas fa-tshirt mr-2"></i> Apparel
          </TabsTrigger>
        </TabsList>
        
        <div className="flex flex-wrap gap-4 mb-6 bg-primary/5 p-4 rounded-lg">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Level Filter</label>
            <Select value={levelFilter?.toString() || "all"} onValueChange={(val) => setLevelFilter(val === "all" ? null : parseInt(val))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="10">Level 10 or below</SelectItem>
                <SelectItem value="20">Level 20 or below</SelectItem>
                <SelectItem value="30">Level 30 or below</SelectItem>
                <SelectItem value="40">Level 40 or below</SelectItem>
                <SelectItem value="50">Level 50 or below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getAvailableTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <Select value={priceSort || "default"} onValueChange={(val) => setPriceSort(val === "default" ? null : val as 'asc' | 'desc')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Price Sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="asc">Price: Low to High</SelectItem>
                <SelectItem value="desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto flex items-end">
            <Button 
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {
                setRarityFilter('all');
                setLevelFilter(null);
                setTypeFilter('all');
                setPriceSort(null);
              }}
            >
              <i className="fas fa-times-circle mr-2"></i> Clear Filters
            </Button>
          </div>
        </div>
        
        <TabsContent value="weapons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsToDisplay.map(weapon => (
              <Card key={weapon.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-serif">
                      <i className={`fas ${weapon.icon} mr-2 text-primary`}></i> 
                      {weapon.name}
                    </CardTitle>
                    <Badge className={getRarityColor(weapon.rarity)}>
                      {weapon.rarity.charAt(0).toUpperCase() + weapon.rarity.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{weapon.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-primary/5 p-2 rounded">
                      {renderStats(weapon.stats)}
                    </div>
                    
                    <div className="text-sm font-medium space-y-1">
                      <div className="flex justify-between">
                        <span>Required Level:</span>
                        <span className={game.cultivationLevel < weapon.requiredLevel ? 'text-red-500' : ''}>
                          {weapon.requiredLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <div className="space-x-2">
                          {weapon.price.gold > 0 && <span className="text-amber-600">{weapon.price.gold} Gold</span>}
                          {weapon.price.spiritualStones > 0 && <span className="text-blue-600">{weapon.price.spiritualStones} Qi Stones</span>}
                          {weapon.price.qi > 0 && <span className="text-green-600">{weapon.price.qi} Qi</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => purchaseItem(weapon)}
                    disabled={!canAfford(weapon) || !meetsLevelRequirement(weapon)}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="apparel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsToDisplay.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-serif">
                      <i className={`fas ${item.icon.startsWith('fa-') ? item.icon : 'fa-'+item.icon} mr-2 text-primary`}></i> 
                      {item.name}
                    </CardTitle>
                    <Badge className={getRarityColor(item.rarity)}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-primary/5 p-2 rounded">
                      {renderStats(item.stats)}
                    </div>
                    
                    <div className="text-sm font-medium space-y-1">
                      <div className="flex justify-between">
                        <span>Required Level:</span>
                        <span className={game.cultivationLevel < item.requiredLevel ? 'text-red-500' : ''}>
                          {item.requiredLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <div className="space-x-2">
                          {item.price.gold > 0 && <span className="text-amber-600">{item.price.gold} Gold</span>}
                          {item.price.spiritualStones > 0 && <span className="text-blue-600">{item.price.spiritualStones} Qi Stones</span>}
                          {item.price.qi > 0 && <span className="text-green-600">{item.price.qi} Qi</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => purchaseItem(item)}
                    disabled={!canAfford(item) || !meetsLevelRequirement(item)}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}