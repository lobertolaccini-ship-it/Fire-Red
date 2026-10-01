import { GameConfig } from './src/config.js';
import { BootScene } from './src/scenes/BootScene.js';
import { WorldScene } from './src/scenes/WorldScene.js';
import { BattleScene } from './src/scenes/BattleScene.js';

/**
 * Configuração principal da instância do Phaser 3 Engine.
 * Otimizado para Pixel Art e fidelidade gráfica retrô GBA.
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GameConfig.NATIVE_WIDTH,
  height: GameConfig.NATIVE_HEIGHT,
  zoom: GameConfig.ZOOM,
  pixelArt: true, // Desativa anti-aliasing e interpolação bilinear para preservar os pixels nítidos
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, WorldScene, BattleScene]
};

// Inicializa a instância do jogo
window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(config);
  window.__GAME_INSTANCE__ = game;
});
