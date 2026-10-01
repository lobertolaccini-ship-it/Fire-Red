/**
 * Banco de dados de Pokémon, Golpes e Tabela de Tipos da Geração III.
 */

export const MOVES = {
  tackle: {
    id: 'tackle',
    name: 'Investida',
    type: 'normal',
    power: 35,
    accuracy: 95,
    maxPp: 35
  },
  scratch: {
    id: 'scratch',
    name: 'Arranhão',
    type: 'normal',
    power: 40,
    accuracy: 100,
    maxPp: 35
  },
  ember: {
    id: 'ember',
    name: 'Brasa',
    type: 'fire',
    power: 40,
    accuracy: 100,
    maxPp: 25
  },
  gust: {
    id: 'gust',
    name: 'Rajada de Vento',
    type: 'flying',
    power: 40,
    accuracy: 100,
    maxPp: 35
  },
  quick_attack: {
    id: 'quick_attack',
    name: 'Ataque Rápido',
    type: 'normal',
    power: 40,
    accuracy: 100,
    priority: 1,
    maxPp: 30
  }
};

export const POKEMON_SPECIES = {
  charmander: {
    id: 'charmander',
    name: 'Charmander',
    types: ['fire'],
    baseHP: 39,
    baseAttack: 52,
    baseDefense: 43,
    baseSpeed: 65,
    moves: ['scratch', 'ember']
  },
  pidgey: {
    id: 'pidgey',
    name: 'Pidgey',
    types: ['normal', 'flying'],
    baseHP: 40,
    baseAttack: 45,
    baseDefense: 40,
    baseSpeed: 56,
    moves: ['tackle', 'gust']
  },
  rattata: {
    id: 'rattata',
    name: 'Rattata',
    types: ['normal'],
    baseHP: 30,
    baseAttack: 56,
    baseDefense: 35,
    baseSpeed: 72,
    moves: ['tackle', 'quick_attack']
  }
};

export const ROUTE_1_ENCOUNTERS = [
  { speciesId: 'pidgey', minLevel: 2, maxLevel: 4, chance: 0.6 },
  { speciesId: 'rattata', minLevel: 2, maxLevel: 3, chance: 0.4 }
];

/**
 * Instancia um Pokémon com nível, HP máximo, stats e golpes calculados
 */
export function createPokemonInstance(speciesId, level = 5) {
  const species = POKEMON_SPECIES[speciesId];
  if (!species) throw new Error(`Espécie ${speciesId} não encontrada.`);

  // Cálculo simplificado de stats clássicos de Pokémon
  const maxHp = Math.floor(((2 * species.baseHP + 15) * level) / 100) + level + 10;
  const attack = Math.floor(((2 * species.baseAttack + 15) * level) / 100) + 5;
  const defense = Math.floor(((2 * species.baseDefense + 15) * level) / 100) + 5;
  const speed = Math.floor(((2 * species.baseSpeed + 15) * level) / 100) + 5;

  const moves = species.moves.map(moveId => ({
    ...MOVES[moveId],
    currentPp: MOVES[moveId].maxPp
  }));

  return {
    speciesId,
    name: species.name,
    level,
    types: [...species.types],
    maxHp,
    currentHp: maxHp,
    attack,
    defense,
    speed,
    moves
  };
}
