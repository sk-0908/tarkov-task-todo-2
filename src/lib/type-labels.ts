export const TYPE_LABELS: Record<string, { ja: string; en: string }> = {
  ammo: { ja: '弾薬', en: 'Ammo' },
  ammobox: { ja: '弾薬箱', en: 'Ammo Box' },
  weapon: { ja: '武器', en: 'Weapon' },
  armor: { ja: 'アーマー', en: 'Armor' },
  armoredrig: { ja: 'アーマーリグ', en: 'Armored Rig' },
  rig: { ja: 'タクティカルリグ', en: 'Tactical Rig' },
  backpack: { ja: 'バックパック', en: 'Backpack' },
  helmet: { ja: 'ヘルメット', en: 'Helmet' },
  facecover: { ja: 'フェイスカバー', en: 'Face Cover' },
  eyewear: { ja: 'アイウェア', en: 'Eyewear' },
  headphones: { ja: 'ヘッドセット', en: 'Headset' },
  medical: { ja: '医療品', en: 'Medical' },
  meds: { ja: '医療品', en: 'Medical' },
  stim: { ja: '注射器', en: 'Stimulator' },
  food: { ja: '食料', en: 'Food' },
  fooddrink: { ja: '食料/飲料', en: 'Food/Drink' },
  drink: { ja: '飲料', en: 'Drink' },
  barter: { ja: '交換アイテム', en: 'Barter Item' },
  barteritem: { ja: '交換アイテム', en: 'Barter Item' },
  container: { ja: 'コンテナ', en: 'Container' },
  grenade: { ja: 'グレネード', en: 'Grenade' },
  melee: { ja: '近接武器', en: 'Melee' },
  key: { ja: '鍵', en: 'Key' },
  keycard: { ja: 'キー', en: 'Keycard' },
  mod: { ja: 'アタッチメント', en: 'Attachment' },
  muzzle: { ja: 'マズル', en: 'Muzzle' },
  suppressor: { ja: 'サプレッサー', en: 'Suppressor' },
  grip: { ja: 'グリップ', en: 'Grip' },
  pistolgrip: { ja: 'ピストルグリップ', en: 'Pistol Grip' },
  foregrip: { ja: 'フォアグリップ', en: 'Foregrip' },
  mount: { ja: 'マウント', en: 'Mount' },
  mag: { ja: 'マガジン', en: 'Magazine' },
  magazine: { ja: 'マガジン', en: 'Magazine' },
  scope: { ja: 'スコープ', en: 'Scope' },
  sight: { ja: 'サイト', en: 'Sight' },
  stock: { ja: 'ストック', en: 'Stock' },
  handguard: { ja: 'ハンドガード', en: 'Handguard' },
  buttstock: { ja: 'バットストック', en: 'Buttstock' },
  charginghandle: { ja: 'チャージングハンドル', en: 'Charging Handle' },
  gasblock: { ja: 'ガスブロック', en: 'Gas Block' },
  recoilpad: { ja: 'リコイルパッド', en: 'Recoil Pad' },
  toolkit: { ja: '工具', en: 'Tool' },
  electronics: { ja: '電子機器', en: 'Electronics' },
  info: { ja: '情報', en: 'Info' },
  money: { ja: '通貨', en: 'Money' },
};

export function getTypeLabel(value: string, lang: 'ja' | 'en' = 'ja'): string {
  const key = (value || '').toString().toLowerCase();
  const label = TYPE_LABELS[key];
  if (label) return label[lang];
  // fallback: capitalize
  const fallback = value?.toString() || '';
  return lang === 'ja' ? fallback : fallback;
}

// Type grouping
export const TYPE_GROUPS: Record<string, string> = {
  ammo: 'ammo', ammobox: 'ammo',
  weapon: 'weapon', melee: 'weapon',
  armor: 'armor', armoredrig: 'armor', rig: 'armor', helmet: 'armor', facecover: 'armor', eyewear: 'armor', headphones: 'armor',
  backpack: 'container', container: 'container',
  medical: 'medical', meds: 'medical', stim: 'medical',
  grenade: 'grenade',
  key: 'key', keycard: 'key',
  mod: 'mod', muzzle: 'mod', suppressor: 'mod', grip: 'mod', pistolgrip: 'mod', foregrip: 'mod', mount: 'mod', mag: 'mod', magazine: 'mod', scope: 'mod', sight: 'mod', stock: 'mod', handguard: 'mod', buttstock: 'mod', charginghandle: 'mod', gasblock: 'mod', recoilpad: 'mod',
  barter: 'barter', barteritem: 'barter', electronics: 'barter', info: 'barter', money: 'barter', toolkit: 'barter',
};

export const GROUP_LABELS: Record<string, { ja: string; en: string }> = {
  ammo: { ja: '弾薬', en: 'Ammo' },
  weapon: { ja: '武器', en: 'Weapons' },
  armor: { ja: '防具/装備', en: 'Armor/Gear' },
  container: { ja: 'コンテナ/バッグ', en: 'Containers/Bags' },
  medical: { ja: '医療', en: 'Medical' },
  grenade: { ja: 'グレネード', en: 'Grenades' },
  key: { ja: '鍵', en: 'Keys' },
  mod: { ja: 'アタッチメント', en: 'Mods' },
  barter: { ja: '交換/資材', en: 'Barter/Materials' },
  other: { ja: 'その他', en: 'Other' },
};

