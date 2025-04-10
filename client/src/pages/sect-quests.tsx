import { useState, useEffect, useRef } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Quest {
  id: string;
  name: string;
  description: string;
  objective: string;
  type: 'sect' | 'main' | 'side' | 'hidden' | 'daily' | 'weekly';
  progress: number;
  target: number;
  rewards: {
    gold: number;
    spiritualStones: number;
    experience: number;
    items: string[];
  };
  deadline?: string;
  completed: boolean;
  requiredLevel?: number;
  location?: string;
  enemyType?: string;
}

// These helper functions are defined at the bottom of the file

export default function SectQuests() {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("available");
  const [refreshTime, setRefreshTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Check if character is created and setup auto-refresh
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    } else {
      // Generate quests based on player level if none exist
      if (quests.length === 0) {
        generateQuests();
        startQuestRefreshTimer();
      }
    }
    
    return () => {
      // Cleanup timers on unmount
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    };
  }, [game.characterCreated, setLocation, quests.length]);
  
  // Update the countdown timer every second
  useEffect(() => {
    if (refreshTime) {
      // Set initial time remaining
      setTimeRemaining(Math.max(0, Math.ceil((refreshTime - Date.now()) / 1000)));
      
      // Start a timer to update the countdown
      countdownTimer.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((refreshTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
        
        // Clear interval once timer reaches 0
        if (remaining <= 0 && countdownTimer.current) {
          clearInterval(countdownTimer.current);
        }
      }, 1000);
    } else {
      // Clear the countdown timer if no refresh time
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    }
    
    return () => {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    };
  }, [refreshTime]);
  
  // Start a timer to refresh quests automatically
  const startQuestRefreshTimer = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    
    // Set refresh time to 3 minutes (180 seconds) from now
    const nextRefreshTime = Date.now() + 180000;
    setRefreshTime(nextRefreshTime);
    
    refreshTimer.current = setTimeout(() => {
      toast({
        title: "New Quests Available",
        description: "The sect has issued new tasks for you to complete.",
        variant: "default"
      });
      generateQuests();
      setRefreshTime(null);
    }, 180000); // 3 minutes
  };
  
  // Generate a set of quests based on player level
  const generateQuests = () => {
    const playerLevel = game.cultivationLevel;
    const newQuests: Quest[] = [];
    
    // Add cultivation quests with Wuxia-themed names
    newQuests.push({
      id: `cultivation-${Date.now()}`,
      name: "Profound Dao Heart Tempering",
      description: "Meditate on the fundamental principles of cultivation to strengthen your Dao Heart",
      objective: "Accumulate Qi energy through meditation",
      type: "sect",
      progress: 0,
      target: playerLevel * 150, // More challenging
      rewards: {
        gold: playerLevel * 30,
        spiritualStones: Math.ceil(playerLevel * 0.8),
        experience: playerLevel * 25,
        items: []
      },
      completed: false,
      requiredLevel: 1
    });
    
    // Add combat quests with Wuxia-themed names
    const enemyTypes = [
      { type: 'beast', name: 'Spirit Beast' },
      { type: 'wolf', name: 'Frost Wind Wolf' },
      { type: 'bear', name: 'Blood Mist Bear' },
      { type: 'snake', name: 'Nine-Pattern Serpent' },
      { type: 'tiger', name: 'White Mountain Tiger' },
      { type: 'eagle', name: 'Golden Wing Eagle' },
      { type: 'rogue-cultivator', name: 'Rogue Cultivator' }
    ];
    
    const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    newQuests.push({
      id: `combat-${Date.now()}`,
      name: `Subdue the ${randomEnemy.name}`,
      description: `Elder Feng has requested disciples to exterminate ${randomEnemy.name}s that are threatening nearby spiritual herb gardens. Their corrupted energy is polluting the natural environment.`,
      objective: `Defeat ${randomEnemy.name}s in combat`,
      type: "sect",
      progress: 0,
      target: Math.max(3, Math.floor(playerLevel * 0.5)), // Make it easier to complete
      rewards: {
        gold: playerLevel * 45,
        spiritualStones: Math.ceil(playerLevel * 0.6) + 2,
        experience: playerLevel * 35,
        items: []
      },
      completed: false,
      requiredLevel: 1,
      enemyType: randomEnemy.type
    });
    
    // Add breakthrough quest for higher levels
    if (playerLevel >= 5) {
      newQuests.push({
        id: `breakthrough-${Date.now()}`,
        name: "Heaven Defying Breakthrough",
        description: "Achieve a realm breakthrough by purifying your core and harmonizing your meridians with spiritual energy from the heavens",
        objective: "Perform a successful realm breakthrough ritual",
        type: "sect",
        progress: 0,
        target: 1,
        rewards: {
          gold: playerLevel * 80,
          spiritualStones: playerLevel * 2,
          experience: playerLevel * 50,
          items: []
        },
        completed: false,
        requiredLevel: 5
      });
    }
    
    // Add resource gathering quest with Wuxia-themed name
    const locationsWithNames = [
      { id: 'forest', name: 'Verdant Spirit Forest' },
      { id: 'mountain', name: 'Azure Dragon Mountains' },
      { id: 'ruins', name: 'Immortal Emperor Ruins' }
    ];
    
    const randomLocation = locationsWithNames[Math.floor(Math.random() * locationsWithNames.length)];
    
    // Select a random resource type based on location
    const resourceTypes = [
      'Spirit Herbs', 'Heavenly Ores', 'Lightning Essence', 
      'Soul Crystals', 'Dragon Veins', 'Phoenix Feathers'
    ];
    
    const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
    newQuests.push({
      id: `gather-${Date.now()}`,
      name: `Harvest of ${randomResource}`,
      description: `The sect's Grand Elder needs precious ${randomResource} from ${randomLocation.name} for an upcoming alchemy ritual. These materials only appear during specific spiritual convergences and must be gathered with care.`,
      objective: `Gather ${randomResource} from ${randomLocation.name}`,
      type: "sect",
      progress: 0,
      target: 1, // Always one gather to complete the quest
      rewards: {
        gold: playerLevel * 40,
        spiritualStones: Math.ceil(playerLevel * 0.7),
        experience: playerLevel * 30,
        items: []
      },
      completed: false,
      requiredLevel: 1,
      location: randomLocation.id
    });
    
    // Add up to 3 additional random quests based on player level
    for (let i = 0; i < Math.min(3, playerLevel); i++) {
      const questTypes = [
        {
          name: "Herb Collection",
          description: "Collect rare herbs for the sect's alchemy division",
          objective: "Gather special herbs",
          rewards: {
            gold: playerLevel * 15 + Math.floor(Math.random() * 20),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 5)),
            experience: playerLevel * 12,
            items: []
          }
        },
        {
          name: "Sect Defense",
          description: "Help defend the sect grounds from intruders",
          objective: "Patrol the sect grounds",
          rewards: {
            gold: playerLevel * 20 + Math.floor(Math.random() * 15),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 4)),
            experience: playerLevel * 18,
            items: []
          }
        },
        {
          name: "Knowledge Seeking",
          description: "Study ancient texts in the sect library",
          objective: "Study cultivation techniques",
          rewards: {
            gold: playerLevel * 10 + Math.floor(Math.random() * 10),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 3)),
            experience: playerLevel * 25,
            items: []
          }
        }
      ];
      
      const randomQuest = questTypes[Math.floor(Math.random() * questTypes.length)];
      
      newQuests.push({
        id: `additional-${i}-${Date.now()}`,
        name: randomQuest.name,
        description: randomQuest.description,
        objective: randomQuest.objective,
        type: "sect",
        progress: 0,
        target: Math.max(1, Math.floor(playerLevel / 3)),
        rewards: randomQuest.rewards,
        completed: false,
        requiredLevel: 1
      });
    }
    
    // Filter to only show quests appropriate for player level
    const filteredQuests = newQuests.filter(quest => 
      quest.requiredLevel === undefined || quest.requiredLevel <= playerLevel
    );
    
    // Limit to 6 quests maximum to avoid clutter
    const finalQuests = filteredQuests.slice(0, 6);
    
    // Use the functional update form
    setQuests(() => finalQuests);
  };
  
  // Progress a quest
  const progressQuest = (quest: Quest) => {
    if (quest.completed) return;
    
    const newProgress = Math.min(quest.progress + 1, quest.target);
    const updatedQuest = { ...quest, progress: newProgress };
    
    if (newProgress >= quest.target) {
      updatedQuest.completed = true;
      toast({
        title: "Quest Completed!",
        description: `You have completed "${quest.name}"`,
        variant: "default"
      });
    } else {
      toast({
        title: "Quest Progress",
        description: `${newProgress}/${quest.target} ${quest.objective}`,
        variant: "default"
      });
    }
    
    // Use the callback form of setState to avoid dependency on current state
    setQuests(prevQuests => prevQuests.map(q => q.id === quest.id ? updatedQuest : q));
  };
  
  // Complete a quest and claim rewards
  const completeQuest = (quest: Quest) => {
    if (!quest.completed) return;
    
    // Update game state with rewards
    updateGameState(state => ({
      ...state,
      gold: state.gold + quest.rewards.gold,
      spiritualStones: state.spiritualStones + quest.rewards.spiritualStones,
      cultivationProgress: state.cultivationProgress + quest.rewards.experience
    }));
    
    toast({
      title: "Rewards Claimed",
      description: `You gained ${quest.rewards.gold} gold, ${quest.rewards.spiritualStones} Qi stones, and ${quest.rewards.experience} cultivation experience.`,
      variant: "default"
    });
    
    // Remove the completed quest using the functional update pattern
    setQuests(prevQuests => {
      const updatedQuests = prevQuests.filter(q => q.id !== quest.id);
      
      // If few quests remain after this update, generate more in a timeout
      // This prevents state updates during render
      if (updatedQuests.length <= 5) {
        setTimeout(() => generateQuests(), 0);
      }
      
      return updatedQuests;
    });
  };
  
  // Generate a replacement quest when one is completed
  const generateReplacementQuest = () => {
    const playerLevel = game.cultivationLevel;
    const questTypes = [
      { 
        name: "Divine Scripture Comprehension",
        description: "Gain enlightenment by studying the sect's most sacred cultivation techniques",
        objective: "Comprehend the profound mysteries in ancient texts",
        target: Math.max(3, Math.floor(playerLevel * 0.6))
      },
      { 
        name: "Demonic Beast Suppression",
        description: "The sect needs powerful disciples to subdue demonic beasts threatening nearby territories",
        objective: "Hunt and defeat corrupted beasts in the wilderness",
        target: Math.max(4, Math.floor(playerLevel * 0.7))
      },
      { 
        name: "Spirit Treasure Collection",
        description: "Gather rare spiritual treasures to strengthen the sect's foundation",
        objective: "Collect spiritual treasures throughout the realm",
        target: Math.max(3, Math.floor(playerLevel * 0.5))
      },
      { 
        name: "Array Formation Defense",
        description: "Assist in maintaining the sect's defensive formations against rival sects",
        objective: "Channel spiritual energy into protective arrays",
        target: Math.max(5, Math.floor(playerLevel * 0.6))
      },
      { 
        name: "Mystic Artifact Refinement",
        description: "Help the sect's artifact refinement division forge spiritual weapons",
        objective: "Contribute to the refinement of spiritual artifacts",
        target: Math.max(4, Math.floor(playerLevel * 0.6))
      },
      { 
        name: "Heavenly Dao Insight",
        description: "Meditate on the principles of the Heavenly Dao to gain profound insights",
        objective: "Achieve breakthroughs in your understanding of cultivation",
        target: Math.max(3, Math.floor(playerLevel * 0.8))
      }
    ];
    
    const randomQuest = questTypes[Math.floor(Math.random() * questTypes.length)];
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      name: randomQuest.name,
      description: randomQuest.description,
      objective: randomQuest.objective,
      type: "sect",
      progress: 0,
      target: randomQuest.target,
      rewards: {
        gold: playerLevel * 35 + Math.floor(Math.random() * 30),
        spiritualStones: Math.max(2, Math.floor(playerLevel * 0.6)),
        experience: playerLevel * 25 + Math.floor(Math.random() * 15),
        items: []
      },
      completed: false,
      requiredLevel: Math.max(1, playerLevel - 2)
    };
    
    // Use functional update pattern
    setQuests(prevQuests => [...prevQuests, newQuest]);
    
    // Start the auto-refresh timer again when a quest is completed
    startQuestRefreshTimer();
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-tasks mr-2"></i>
            Sect Quests
          </h1>
          <p className="text-gray-700">Complete tasks to earn rewards and gain favor with your sect</p>
        </div>

        {!game.characterCreated ? (
          <Card className="bg-white bg-opacity-90 shadow-lg text-center p-6">
            <p>Please create your character first.</p>
            <Button className="mt-4" onClick={() => setLocation("/character")}>
              Create Character
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium">Available Quests</h2>
                <p className="text-sm text-gray-600">Showing {quests.length} quests</p>
                {refreshTime && (
                  <p className="text-xs text-amber-600 mt-1">
                    <i className="fas fa-clock mr-1"></i>
                    New quests in: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
              <Button onClick={generateQuests}>
                <i className="fas fa-sync-alt mr-2"></i> Refresh Quests
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {quests.length === 0 ? (
                <Card className="bg-white shadow-md text-center p-6">
                  <p>No quests available. Generate new quests to get started.</p>
                </Card>
              ) : (
                quests.map(quest => (
                  <Card key={quest.id} className={`bg-white shadow-md transition-all ${quest.completed ? "border-green-300 border-2" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center">
                          {quest.name}
                          {quest.completed && (
                            <Badge className="ml-2 bg-green-100 text-green-800">
                              <i className="fas fa-check mr-1"></i> Completed
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge className="bg-primary/10 text-primary">
                          {quest.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{quest.description}</p>
                      <div className="mt-2 bg-gray-50 p-2 rounded-md text-xs">
                        <strong className="text-primary">How to complete:</strong> {getQuestGuide(quest)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress: {quest.objective}</span>
                          <span>{quest.progress} / {quest.target}</span>
                        </div>
                        <Progress value={(quest.progress / quest.target) * 100} className="h-2" />
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1">Rewards</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center">
                            <i className="fas fa-coins text-amber-500 mr-1"></i>
                            <span>{quest.rewards.gold} Gold</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-gem text-blue-500 mr-1"></i>
                            <span>{quest.rewards.spiritualStones} Stones</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-fire text-red-500 mr-1"></i>
                            <span>{quest.rewards.experience} Exp</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {quest.completed ? (
                        <Button onClick={() => completeQuest(quest)} className="w-full">
                          <i className="fas fa-trophy mr-2"></i> Claim Rewards
                        </Button>
                      ) : (
                        <>
                          <div className="text-sm text-gray-600">
                            {quest.requiredLevel && (
                              <span className="mr-4">Required Level: {quest.requiredLevel}</span>
                            )}
                            {quest.location && (
                              <span className="mr-4">Location: {formatLocationName(quest.location)}</span>
                            )}
                            {quest.enemyType && (
                              <span>Target: {capitalizeFirst(quest.enemyType)}</span>
                            )}
                          </div>
                          <div className="text-sm text-primary">
                            <i className="fas fa-info-circle mr-1"></i> 
                            See guide for completion details
                          </div>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatLocationName(location: string): string {
  const names: Record<string, string> = {
    'forest': 'Verdant Spirit Forest',
    'mountain': 'Azure Dragon Mountains',
    'ruins': 'Immortal Emperor Ruins',
    'jade-valley': 'Nine Treasures Jade Valley',
    'poison-marsh': 'Miasma Venom Marsh',
    'flame-desert': 'Nine Suns Flame Desert',
    'frozen-peak': 'Frost Immortal Summit',
    'demonic-beast': 'Demonic Spirit Beast',
    'qi-wolf': 'Frost Wind Spirit Wolf',
    'bloodbear': 'Blood Mist Cave Bear',
    'venomsnake': 'Nine-Pattern Poison Serpent',
    'celestial-tiger': 'White Mountain Spirit Tiger',
    'golden-eagle': 'Golden Wing Thunder Eagle',
    'rogue-cultivator': 'Rogue Cultivator'
  };
  
  return names[location] || location;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get appropriate completion guide based on quest type
function getQuestGuide(quest: Quest): string {
  if (quest.name.includes("Profound Dao Heart") || quest.name.includes("Divine Scripture") || quest.name.includes("Heavenly Dao")) {
    return "Go to the main cultivation page. Fill your cultivation bar to maximum by using the 'Cultivate' button repeatedly. Each cultivation session will increase your progress toward the target.";
  }
  
  if (quest.name.includes("Breakthrough") || quest.name.includes("Realm Breakthrough")) {
    return "Accumulate enough cultivation progress, then attempt a breakthrough on the main cultivation page by clicking the 'Attempt Breakthrough' button when it becomes available.";
  }
  
  if (quest.enemyType || quest.name.includes("Subdue") || quest.name.includes("Beast") || quest.name.includes("Hunt") || quest.name.includes("Demonic Beast")) {
    const enemyName = quest.enemyType ? formatLocationName(quest.enemyType) : "enemies";
    return `Travel to the Combat page and battle ${enemyName} by selecting an appropriate hunting ground and engaging in combat. Defeat enemies until you reach the target number.`;
  }
  
  if (quest.location || quest.name.includes("Harvest") || quest.name.includes("Gather") || quest.name.includes("Collection")) {
    const locationName = quest.location ? formatLocationName(quest.location) : "appropriate locations";
    return `Visit the Map page and travel to ${locationName}. Click on gathering spots to collect resources until you reach the target number.`;
  }
  
  if (quest.name.includes("Artifact") || quest.name.includes("Refinement")) {
    return "Go to the Artifact Refinement section and participate in the refinement process by contributing materials and spiritual energy. Each successful refinement session counts toward your progress.";
  }
  
  if (quest.name.includes("Array") || quest.name.includes("Formation") || quest.name.includes("Defense")) {
    return "Visit the Sect Defense page and participate in patrol duties by activating the defensive arrays. Each successful patrol adds to your progress.";
  }
  
  if (quest.name.includes("Knowledge") || quest.name.includes("Study")) {
    return "Go to the Sect Library and study cultivation techniques. Each study session will increase your comprehension and count toward quest progress.";
  }
  
  if (quest.name.includes("Elder")) {
    return "Visit the Sect Elders Hall and speak with the elders to receive their specific requests. Complete the tasks they assign to progress in the quest.";
  }
  
  // Default guide if no specific category is matched
  return "Participate in activities related to the quest objective. Your progress will update automatically as you perform relevant actions throughout the game.";
}