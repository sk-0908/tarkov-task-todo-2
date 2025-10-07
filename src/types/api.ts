// Tarkov API GraphQL Schema Types

export interface Item {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  normalizedName: string;
  width: number;
  height: number;
  iconLink?: string;
  gridImageLink?: string;
  baseImageLink?: string;
  inspectImageLink?: string;
  image512pxLink?: string;
  image8xLink?: string;
  wikiLink?: string;
  avg24hPrice?: number;
  basePrice?: number;
  types: string[];
}

export interface Trader {
  id: string;
  name: string;
  normalizedName: string;
  description?: string;
  resetTime?: string;
  currency: Item;
  discount: number;
  levels: TraderLevel[];
  reputationLevels: TraderReputationLevel[];
  barters: Barter[];
  cashOffers: TraderCashOffer[];
  imageLink?: string;
  image4xLink?: string;
  iconLink?: string;
  tarkovDataId?: number;
}

export interface TraderLevel {
  id: string;
  level: number;
  requiredPlayerLevel: number;
  requiredReputation: number;
  requiredCommerce: number;
  payRate: number;
  insuranceRate?: number;
  repairCostMultiplier?: number;
  barters: Barter[];
  cashOffers: TraderCashOffer[];
  imageLink?: string;
  image4xLink?: string;
}

export interface Barter {
  id: string;
  trader: Trader;
  level: number;
  taskUnlock?: Task;
  requiredItems: ContainedItem[];
  rewardItems: ContainedItem[];
  buyLimit?: number;
}

export interface TraderCashOffer {
  id?: string;
  item: Item;
  minTraderLevel?: number;
  price?: number;
  currency?: string;
  currencyItem?: Item;
  priceRUB?: number;
  taskUnlock?: Task;
  buyLimit?: number;
}

export interface ContainedItem {
  item: Item;
  count: number;
  quantity: number;
  attributes?: ItemAttribute[];
}

export interface ItemAttribute {
  name: string;
  value: number;
}

export interface Task {
  id?: string;
  tarkovDataId?: number;
  name: string;
  normalizedName: string;
  trader: Trader;
  map?: Map;
  experience: number;
  wikiLink?: string;
  taskImageLink?: string;
  minPlayerLevel?: number;
  taskRequirements: TaskRequirement[];
  traderRequirements: RequirementTrader[];
  availableDelaySecondsMin?: number;
  availableDelaySecondsMax?: number;
  objectives: TaskObjective[];
  startRewards?: TaskRewards;
  finishRewards?: TaskRewards;
  failConditions: TaskObjective[];
  failureOutcome?: TaskRewards;
  restartable?: boolean;
  factionName?: string;
  kappaRequired?: boolean;
  lightkeeperRequired?: boolean;
  descriptionMessageId?: string;
  startMessageId?: string;
  successMessageId?: string;
  failMessageId?: string;
}

export interface Map {
  id: string;
  tarkovDataId?: string;
  name: string;
  normalizedName: string;
  wiki?: string;
  description?: string;
  enemies?: string[];
  raidDuration?: number;
  players?: string;
  bosses: BossSpawn[];
  nameId?: string;
  accessKeys: TaskKey[];
  accessKeysMinPlayerLevel?: number;
  minPlayerLevel?: number;
  maxPlayerLevel?: number;
  spawns?: MapSpawn[];
  extracts: MapExtract[];
  transits: MapTransit[];
  locks: Lock[];
  iconLink?: string;
  switches: MapSwitch[];
  hazards: MapHazard[];
  lootContainers: LootContainerPosition[];
  lootLoose: LootLoosePosition[];
  stationaryWeapons: StationaryWeaponPosition[];
  artillery?: MapArtillerySettings;
}

export interface TaskObjective {
  id?: string;
  type: string;
  description: string;
  maps: Map[];
  optional: boolean;
  items?: Item[];
}

export interface TaskRequirement {
  id?: string;
  task: Task;
}

export interface RequirementTrader {
  id?: string;
  trader: Trader;
  requirementType?: string;
  compareMethod?: string;
  value?: number;
}

export interface TaskRewards {
  traderStanding: TraderStanding[];
  items: ContainedItem[];
  offerUnlock: OfferUnlock[];
  skillLevelReward: SkillLevel[];
  traderUnlock: RequirementTrader[];
  craftUnlock: Craft[];
}

export interface TraderStanding {
  trader: Trader;
  standing: number;
}

export interface OfferUnlock {
  id?: string;
  trader: Trader;
  level: number;
  item: Item;
}

export interface SkillLevel {
  skill: Skill;
  name: string;
  level: number;
}

export interface Skill {
  id?: string;
  name?: string;
  imageLink?: string;
}

export interface Craft {
  id: string;
  station: HideoutStation;
  level: number;
  taskUnlock?: Task;
  duration: number;
  requiredItems: ContainedItem[];
  requiredQuestItems: ContainedItem[];
  rewardItems: ContainedItem[];
}

export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  imageLink?: string;
  levels: HideoutStationLevel[];
  tarkovDataId?: number;
  crafts: Craft[];
}

export interface HideoutStationLevel {
  id: string;
  level: number;
  constructionTime: number;
  description: string;
  itemRequirements: RequirementItem[];
  stationLevelRequirements: RequirementHideoutStationLevel[];
  skillRequirements: RequirementSkill[];
  traderRequirements: RequirementTrader[];
  tarkovDataId?: number;
  crafts: Craft[];
  bonuses?: HideoutStationBonus[];
}

export interface RequirementItem {
  id?: string;
  item: Item;
  count: number;
  quantity: number;
  attributes?: ItemAttribute[];
}

export interface RequirementHideoutStationLevel {
  id?: string;
  station: HideoutStation;
  level: number;
}

export interface RequirementSkill {
  id?: string;
  name: string;
  skill: Skill;
  level: number;
}

export interface HideoutStationBonus {
  type: string;
  name: string;
  value?: number;
  passive?: boolean;
  production?: boolean;
  slotItems?: Item[];
  skillName?: string;
}

export interface BossSpawn {
  boss: MobInfo;
  spawnChance: number;
  spawnLocations: BossSpawnLocation[];
  escorts: BossEscort[];
  spawnTime?: number;
  spawnTimeRandom?: boolean;
  spawnTrigger?: string;
  switch?: MapSwitch;
}

export interface MobInfo {
  id: string;
  name: string;
  normalizedName: string;
  health: HealthPart[];
  imagePortraitLink?: string;
  imagePosterLink?: string;
  equipment: ContainedItem[];
  items: ContainedItem[];
}

export interface HealthPart {
  id: string;
  max: number;
  bodyPart: string;
}

export interface BossSpawnLocation {
  spawnKey: string;
  name: string;
  chance: number;
}

export interface BossEscort {
  boss: MobInfo;
  amount: BossEscortAmount[];
}

export interface BossEscortAmount {
  count: number;
  chance: number;
}

export interface MapSwitch {
  id: string;
  name?: string;
  switchType?: string;
  activatedBy?: MapSwitch;
  activates: MapSwitchOperation[];
  position?: MapPosition;
}

export interface MapSwitchOperation {
  operation?: string;
  target?: MapSwitchTarget;
}

export interface MapSwitchTarget {
  // Union type - can be various types
}

export interface MapPosition {
  x: number;
  y: number;
  z: number;
}

export interface MapExtract {
  id: string;
  name?: string;
  faction?: string;
  switches: MapSwitch[];
  transferItem?: ContainedItem;
  position: MapPosition;
  outline: MapPosition[];
  top?: number;
  bottom?: number;
}

export interface MapTransit {
  id: string;
  description?: string;
  conditions?: string;
  map?: Map;
  position: MapPosition;
  outline: MapPosition[];
  top?: number;
  bottom?: number;
}

export interface Lock {
  lockType?: string;
  key?: Item;
  needsPower?: boolean;
  position?: MapPosition;
  outline: MapPosition[];
  top?: number;
  bottom?: number;
}

export interface MapHazard {
  hazardType?: string;
  name?: string;
  position: MapPosition;
  outline: MapPosition[];
  top?: number;
  bottom?: number;
}

export interface LootContainerPosition {
  lootContainer: LootContainer;
  position: MapPosition;
}

export interface LootContainer {
  id: string;
  name: string;
  normalizedName: string;
}

export interface LootLoosePosition {
  items?: Item[];
  position: MapPosition;
}

export interface StationaryWeaponPosition {
  stationaryWeapon?: StationaryWeapon;
  position: MapPosition;
}

export interface StationaryWeapon {
  id?: string;
  name?: string;
  shortName?: string;
}

export interface MapArtillerySettings {
  zones?: MapArtilleryZone[];
}

export interface MapArtilleryZone {
  position?: MapPosition;
  outline: MapPosition[];
  top?: number;
  bottom?: number;
}

export interface MapSpawn {
  zoneName?: string;
  position: MapPosition;
  sides?: string[];
  categories?: string[];
}

export interface TaskKey {
  keys: Item[];
  map?: Map;
}

export interface TraderReputationLevel {
  // Union type - can be various types
}

export interface LanguageCode {
  // Enum type
}

export interface ItemType {
  // Enum type
}

export interface ItemCategoryName {
  // Enum type
}

export interface HandbookCategoryName {
  // Enum type
}
