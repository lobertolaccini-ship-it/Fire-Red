/**
 * Constantes globais e configurações de Engine para o jogo estilo Pokémon Fire Red.
 */
export const GameConfig = {
  // Resolução nativa idêntica ao Game Boy Advance (GBA)
  NATIVE_WIDTH: 240,
  NATIVE_HEIGHT: 160,
  ZOOM: 3, // Escala limpa 3x (Renderiza em 720x480)

  // Cada tile do mapa possui 16x16 pixels
  TILE_SIZE: 16,

  // Tempos em milissegundos para transitar entre tiles (Grid Tween)
  WALK_DURATION: 220,    // Velocidade de passo padrão
  RUN_DURATION: 110,     // Velocidade com Running Shoes (Shift)

  // Direções mapeadas com vetores de grid
  DIRECTIONS: {
    UP: { name: 'up', x: 0, y: -1 },
    DOWN: { name: 'down', x: 0, y: 1 },
    LEFT: { name: 'left', x: -1, y: 0 },
    RIGHT: { name: 'right', x: 1, y: 0 }
  }
};
