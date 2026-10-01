import { GameConfig } from '../config.js';

/**
 * Cena de inicialização (Boot)
 * Gera texturas procedurais em Pixel Art no estilo GBA para permitir execução imediata
 * sem dependência obrigatória de arquivos externos de imagem.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createWorldTextures();
    this.createPlayerTextures();
    this.createBattleTextures();

    // Transita imediatamente para a cena do mundo aberto
    this.scene.start('WorldScene');
  }

  /**
   * Cria tiles de grama, caminho de terra, árvores e flores estilo GBA (16x16)
   */
  createWorldTextures() {
    const s = GameConfig.TILE_SIZE; // 16px

    // 1. Grama clara clássica
    const gGrass = this.make.graphics({ x: 0, y: 0, add: false });
    gGrass.fillStyle(0x5cb85c, 1);
    gGrass.fillRect(0, 0, s, s);
    // Detalhes de textura da grama
    gGrass.fillStyle(0x4cae4c, 1);
    gGrass.fillRect(3, 4, 2, 2);
    gGrass.fillRect(11, 2, 2, 2);
    gGrass.fillRect(8, 10, 2, 2);
    gGrass.fillRect(2, 12, 2, 2);
    gGrass.generateTexture('tile_grass', s, s);

    // 2. Grama Alta (Wild Pokemon Grass)
    const gTallGrass = this.make.graphics({ x: 0, y: 0, add: false });
    gTallGrass.fillStyle(0x3d8b3d, 1);
    gTallGrass.fillRect(0, 0, s, s);
    gTallGrass.fillStyle(0x276627, 1);
    gTallGrass.fillRect(2, 2, 4, 12);
    gTallGrass.fillRect(8, 4, 3, 10);
    gTallGrass.fillRect(12, 1, 3, 13);
    gTallGrass.fillStyle(0x5cb85c, 1);
    gTallGrass.fillRect(3, 1, 2, 3);
    gTallGrass.fillRect(9, 3, 1, 2);
    gTallGrass.generateTexture('tile_tall_grass', s, s);

    // 3. Caminho de Terra (Dirt Path)
    const gPath = this.make.graphics({ x: 0, y: 0, add: false });
    gPath.fillStyle(0xd9b382, 1);
    gPath.fillRect(0, 0, s, s);
    gPath.fillStyle(0xc89f6d, 1);
    gPath.fillRect(2, 3, 3, 2);
    gPath.fillRect(9, 8, 2, 2);
    gPath.fillRect(12, 12, 2, 2);
    gPath.generateTexture('tile_path', s, s);

    // 4. Árvore / Obstáculo (Blocker)
    const gTree = this.make.graphics({ x: 0, y: 0, add: false });
    gTree.fillStyle(0x2e6b2e, 1);
    gTree.fillRect(1, 1, s - 2, s - 2);
    gTree.fillStyle(0x1d471d, 1);
    gTree.fillRect(3, 3, s - 6, s - 6);
    gTree.fillStyle(0x55aa55, 1);
    gTree.fillRect(2, 2, 4, 4);
    gTree.generateTexture('tile_tree', s, s);
  }

  /**
   * Gera sprites pixel art do protagonista (Red) em 4 direções (16x16)
   */
  createPlayerTextures() {
    const s = GameConfig.TILE_SIZE; // 16px

    const drawRed = (facing, walkPhase = 0) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });

      // Sombra embaixo dos pés
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(8, 14, 10, 4);

      // Cores do Red (Pokémon Fire Red)
      const redCap = 0xe53935;
      const whiteVisor = 0xffffff;
      const skin = 0xffcc99;
      const blueJacket = 0x1e88e5;
      const darkPants = 0x263238;
      const shoes = 0xd32f2f;

      if (facing === 'down') {
        // Boné
        g.fillStyle(redCap, 1);
        g.fillRect(5, 1, 6, 4);
        g.fillStyle(whiteVisor, 1);
        g.fillRect(4, 5, 8, 1); // Aba branca

        // Rosto
        g.fillStyle(skin, 1);
        g.fillRect(5, 6, 6, 3);
        // Olhos
        g.fillStyle(0x000000, 1);
        g.fillRect(6, 7, 1, 1);
        g.fillRect(9, 7, 1, 1);

        // Jaqueta
        g.fillStyle(blueJacket, 1);
        g.fillRect(4, 9, 8, 4);
        g.fillStyle(whiteVisor, 1); // Colarinho
        g.fillRect(7, 9, 2, 2);

        // Pernas / Pés
        g.fillStyle(darkPants, 1);
        g.fillRect(5, 13, 2, 2);
        g.fillRect(9, 13, 2, 2);

        if (walkPhase === 1) {
          g.fillStyle(shoes, 1);
          g.fillRect(5, 14, 2, 2); // Perna esquerda avançada
        } else if (walkPhase === 2) {
          g.fillStyle(shoes, 1);
          g.fillRect(9, 14, 2, 2); // Perna direita avançada
        } else {
          g.fillStyle(shoes, 1);
          g.fillRect(5, 14, 2, 1);
          g.fillRect(9, 14, 2, 1);
        }
      } else if (facing === 'up') {
        // Boné (de costas)
        g.fillStyle(redCap, 1);
        g.fillRect(5, 1, 6, 5);
        // Cabelo preto atrás
        g.fillStyle(0x212121, 1);
        g.fillRect(5, 6, 6, 2);

        // Jaqueta e Mochila
        g.fillStyle(blueJacket, 1);
        g.fillRect(4, 8, 8, 5);
        g.fillStyle(0xfbc02d, 1); // Mochila amarela característica
        g.fillRect(6, 8, 4, 4);

        // Pernas
        g.fillStyle(darkPants, 1);
        g.fillRect(5, 13, 2, 2);
        g.fillRect(9, 13, 2, 2);

        if (walkPhase === 1) {
          g.fillStyle(shoes, 1);
          g.fillRect(5, 13, 2, 2);
        } else if (walkPhase === 2) {
          g.fillStyle(shoes, 1);
          g.fillRect(9, 13, 2, 2);
        }
      } else if (facing === 'left') {
        // Perfil Esquerda
        g.fillStyle(redCap, 1);
        g.fillRect(4, 1, 7, 4);
        g.fillStyle(whiteVisor, 1);
        g.fillRect(3, 4, 3, 1); // Aba virada para a esquerda

        // Rosto
        g.fillStyle(skin, 1);
        g.fillRect(4, 5, 5, 3);
        g.fillStyle(0x000000, 1);
        g.fillRect(4, 6, 1, 1); // Olho

        // Corpo
        g.fillStyle(blueJacket, 1);
        g.fillRect(4, 8, 7, 5);

        // Pernas
        g.fillStyle(darkPants, 1);
        if (walkPhase === 1) {
          g.fillRect(3, 13, 3, 2);
          g.fillRect(7, 12, 2, 2);
        } else if (walkPhase === 2) {
          g.fillRect(6, 13, 3, 2);
          g.fillRect(4, 12, 2, 2);
        } else {
          g.fillRect(5, 13, 4, 2);
        }
      } else if (facing === 'right') {
        // Perfil Direita
        g.fillStyle(redCap, 1);
        g.fillRect(5, 1, 7, 4);
        g.fillStyle(whiteVisor, 1);
        g.fillRect(10, 4, 3, 1); // Aba virada para a direita

        // Rosto
        g.fillStyle(skin, 1);
        g.fillRect(7, 5, 5, 3);
        g.fillStyle(0x000000, 1);
        g.fillRect(11, 6, 1, 1); // Olho

        // Corpo
        g.fillStyle(blueJacket, 1);
        g.fillRect(5, 8, 7, 5);

        // Pernas
        g.fillStyle(darkPants, 1);
        if (walkPhase === 1) {
          g.fillRect(10, 13, 3, 2);
          g.fillRect(6, 12, 2, 2);
        } else if (walkPhase === 2) {
          g.fillRect(7, 13, 3, 2);
          g.fillRect(9, 12, 2, 2);
        } else {
          g.fillRect(7, 13, 4, 2);
        }
      }

      const key = `player_${facing}${walkPhase === 1 ? '_walk1' : walkPhase === 2 ? '_walk2' : ''}`;
      g.generateTexture(key, s, s);
    };

    // Gera texturas para todas as 4 direções e variações de passos
    ['down', 'up', 'left', 'right'].forEach(dir => {
      drawRed(dir, 0); // Parado (Idle)
      drawRed(dir, 1); // Passo 1
      drawRed(dir, 2); // Passo 2
    });
  }

  /**
   * Gera texturas para a interface de batalha, Pokémon e cenários
   */
  createBattleTextures() {
    // 1. Plataforma de Grama para os Pokémon
    const plat = this.make.graphics({ x: 0, y: 0, add: false });
    plat.fillStyle(0x78c850, 1);
    plat.fillEllipse(48, 16, 96, 30);
    plat.fillStyle(0x589830, 1);
    plat.fillEllipse(48, 16, 88, 22);
    plat.generateTexture('battle_platform', 96, 32);

    // 2. Fundo da Batalha (GBA Day Sky / Grass Field)
    const bg = this.make.graphics({ x: 0, y: 0, add: false });
    bg.fillGradientStyle(0xe8f8ff, 0xe8f8ff, 0xb8e0b8, 0x88c070, 1);
    bg.fillRect(0, 0, GameConfig.NATIVE_WIDTH, 112);
    bg.fillStyle(0x589830, 1);
    bg.fillRect(0, 75, GameConfig.NATIVE_WIDTH, 37);
    bg.fillStyle(0xd0e8b8, 1);
    bg.fillRect(0, 73, GameConfig.NATIVE_WIDTH, 2);
    bg.generateTexture('battle_bg', GameConfig.NATIVE_WIDTH, 112);

    // 3. Charmander (Costas / Back Sprite) - 48x48
    const char = this.make.graphics({ x: 0, y: 0, add: false });
    // Cauda e chama
    char.fillStyle(0xf08030, 1);
    char.fillRect(8, 28, 14, 8); // Cauda
    char.fillStyle(0xf85830, 1);
    char.fillRect(4, 22, 8, 8);  // Fogo base
    char.fillStyle(0xf8d030, 1);
    char.fillRect(2, 24, 6, 4);  // Chama miolo
    // Corpo
    char.fillStyle(0xf08030, 1);
    char.fillRect(16, 16, 20, 24); // Tronco
    char.fillStyle(0xde6018, 1);
    char.fillRect(22, 20, 12, 18); // Sombra das costas
    // Cabeça
    char.fillStyle(0xf08030, 1);
    char.fillRect(18, 6, 18, 14);
    char.generateTexture('pokemon_charmander_back', 48, 48);

    // 4. Pidgey (Frente / Front Sprite) - 40x40
    const pid = this.make.graphics({ x: 0, y: 0, add: false });
    // Corpo / Penas
    pid.fillStyle(0xa89078, 1);
    pid.fillRect(10, 12, 20, 20); // Corpo marrom
    pid.fillStyle(0xf8f8d0, 1);
    pid.fillRect(12, 18, 14, 14); // Peito bege
    // Cabeça e Crista
    pid.fillStyle(0xc03028, 1);
    pid.fillRect(16, 4, 8, 5);   // Penas vermelhas da crista
    pid.fillStyle(0xa89078, 1);
    pid.fillRect(14, 8, 14, 10);
    // Bico e Olho
    pid.fillStyle(0xf8a800, 1);
    pid.fillRect(26, 12, 6, 4);  // Bico
    pid.fillStyle(0x000000, 1);
    pid.fillRect(22, 10, 3, 3);  // Olho
    pid.fillStyle(0xffffff, 1);
    pid.fillRect(23, 11, 1, 1);  // Brilho
    pid.generateTexture('pokemon_pidgey_front', 40, 40);

    // 5. Rattata (Frente / Front Sprite) - 40x40
    const rat = this.make.graphics({ x: 0, y: 0, add: false });
    // Orelhas
    rat.fillStyle(0xa040a0, 1);
    rat.fillRect(8, 6, 7, 7);
    rat.fillRect(25, 6, 7, 7);
    rat.fillStyle(0xf8b090, 1);
    rat.fillRect(10, 8, 3, 4);
    rat.fillRect(27, 8, 3, 4);
    // Cabeça e Corpo roxo
    rat.fillStyle(0xa040a0, 1);
    rat.fillRect(12, 10, 16, 14);
    rat.fillRect(10, 20, 20, 14);
    // Barriga bege
    rat.fillStyle(0xf8e0c0, 1);
    rat.fillRect(14, 22, 12, 10);
    // Dentes proeminentes
    rat.fillStyle(0xffffff, 1);
    rat.fillRect(18, 19, 4, 4);
    // Olhos vermelhos
    rat.fillStyle(0xc03028, 1);
    rat.fillRect(14, 12, 3, 3);
    rat.fillRect(23, 12, 3, 3);
    rat.generateTexture('pokemon_rattata_front', 40, 40);

    // 6. Tiles adicionais para construções (telhados e paredes)
    const s = GameConfig.TILE_SIZE;
    const gRedRoof = this.make.graphics({ x: 0, y: 0, add: false });
    gRedRoof.fillStyle(0xd32f2f, 1);
    gRedRoof.fillRect(0, 0, s, s);
    gRedRoof.fillStyle(0xb71c1c, 1);
    gRedRoof.fillRect(0, s - 3, s, 3);
    gRedRoof.generateTexture('tile_roof_red', s, s);

    const gBlueRoof = this.make.graphics({ x: 0, y: 0, add: false });
    gBlueRoof.fillStyle(0x1976d2, 1);
    gBlueRoof.fillRect(0, 0, s, s);
    gBlueRoof.fillStyle(0x0d47a1, 1);
    gBlueRoof.fillRect(0, s - 3, s, 3);
    gBlueRoof.generateTexture('tile_roof_blue', s, s);

    const gLabWall = this.make.graphics({ x: 0, y: 0, add: false });
    gLabWall.fillStyle(0xf5f5f5, 1);
    gLabWall.fillRect(0, 0, s, s);
    gLabWall.fillStyle(0x9e9e9e, 1);
    gLabWall.fillRect(1, 1, s - 2, 2);
    gLabWall.generateTexture('tile_lab', s, s);

    const gDoor = this.make.graphics({ x: 0, y: 0, add: false });
    gDoor.fillStyle(0x5d4037, 1);
    gDoor.fillRect(2, 2, s - 4, s - 2);
    gDoor.fillStyle(0xffeb3b, 1);
    gDoor.fillRect(s - 5, s / 2, 2, 2); // Maçaneta
    gDoor.generateTexture('tile_door', s, s);
  }
}
