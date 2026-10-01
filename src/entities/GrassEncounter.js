import { ROUTE_1_ENCOUNTERS, createPokemonInstance } from '../data/pokemonData.js';

/**
 * Gerenciador de encontros de Pokémon selvagens em grama alta.
 */
export class GrassEncounter {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} encounterRate - Probabilidade de encontro por passo (ex: 0.18 = 18%)
   */
  constructor(scene, encounterRate = 0.18) {
    this.scene = scene;
    this.encounterRate = encounterRate;
    this.stepsInGrass = 0;
  }

  /**
   * Testa se o passo atual na grama alta engatilhou uma batalha selvagem.
   * @param {number} gridX
   * @param {number} gridY
   * @param {Function} isTallGrassCallback - (x, y) => boolean
   * @returns {object|null} Instância do Pokémon selvagem gerado ou null
   */
  checkEncounter(gridX, gridY, isTallGrassCallback) {
    if (!isTallGrassCallback(gridX, gridY)) {
      this.stepsInGrass = 0;
      return null;
    }

    this.stepsInGrass++;

    // Garante que o primeiro passo na grama raramente engatilha de imediato para evitar frustração
    const adjustedRate = this.stepsInGrass === 1 ? this.encounterRate * 0.4 : this.encounterRate;
    const roll = Math.random();

    if (roll < adjustedRate) {
      this.stepsInGrass = 0;
      return this.generateWildPokemon();
    }

    return null;
  }

  /**
   * Seleciona aleatoriamente um Pokémon da tabela de rotas com base nos pesos.
   */
  generateWildPokemon() {
    const roll = Math.random();
    let accumulated = 0;
    let selected = ROUTE_1_ENCOUNTERS[0];

    for (const entry of ROUTE_1_ENCOUNTERS) {
      accumulated += entry.chance;
      if (roll <= accumulated) {
        selected = entry;
        break;
      }
    }

    const level = Phaser.Math.Between(selected.minLevel, selected.maxLevel);
    return createPokemonInstance(selected.speciesId, level);
  }

  /**
   * Efeito visual clássico de entrada em batalha (Flash e faixas pretas)
   * @param {Function} onComplete - Callback chamado ao finalizar a animação
   */
  playBattleTransition(onComplete) {
    const cam = this.scene.cameras.main;
    const width = cam.width;
    const height = cam.height;

    // Flash branco rápido
    cam.flash(300, 255, 255, 255);

    this.scene.time.delayedCall(350, () => {
      // Efeito de persianas / faixas pretas deslizantes
      const graphics = this.scene.add.graphics().setDepth(9999).setScrollFactor(0);
      graphics.fillStyle(0x000000, 1);

      const stripes = 6;
      const stripeHeight = Math.ceil(height / stripes);
      let progress = 0;

      const timer = this.scene.time.addEvent({
        delay: 30,
        repeat: 15,
        callback: () => {
          progress += 0.07;
          graphics.clear();
          graphics.fillStyle(0x000000, 1);
          for (let i = 0; i < stripes; i++) {
            const w = width * Math.min(1, progress);
            const x = (i % 2 === 0) ? 0 : width - w;
            const y = i * stripeHeight;
            graphics.fillRect(x, y, w, stripeHeight + 1);
          }

          if (progress >= 1) {
            timer.remove();
            if (onComplete) onComplete();
          }
        }
      });
    });
  }
}
