import { GameConfig } from '../config.js';
import { Player } from '../entities/Player.js';
import { PalletTownMap, TILE_ID_MAP } from '../data/maps/palletTownMap.js';
import { GrassEncounter } from '../entities/GrassEncounter.js';
import { createPokemonInstance } from '../data/pokemonData.js';

/**
 * Cena principal de exploração (Overworld) de Pallet Town.
 * Carrega mapa em formato Tiled com suporte a colisões e encontros de Pokémon selvagens.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create() {
    this.mapCols = PalletTownMap.width;
    this.mapRows = PalletTownMap.height;
    this.tileSize = GameConfig.TILE_SIZE;

    // Matriz de colisões (0 = livre, 1 = sólido) e matriz de grama alta
    this.collisionGrid = Array.from({ length: this.mapRows }, () => new Array(this.mapCols).fill(0));
    this.tallGrassGrid = Array.from({ length: this.mapRows }, () => new Array(this.mapCols).fill(false));

    // Sistema de Encontros de Grama Alta
    this.grassEncounter = new GrassEncounter(this, 0.20); // 20% de chance de encontro na grama

    // Pokémon inicial do treinador (Charmander Nv. 5)
    this.playerPokemon = createPokemonInstance('charmander', 5);

    // Constrói o mapa a partir das camadas do Tiled
    this.buildTiledMap();

    // Criação do Jogador
    this.player = new Player(
      this,
      9, // Coordenada X inicial (na rua em frente ao laboratório)
      8, // Coordenada Y inicial
      (x, y) => this.isWalkable(x, y),
      (x, y) => this.onPlayerStep(x, y)
    );

    // Câmera do mundo com bounds e tracking suave
    const worldWidth = this.mapCols * this.tileSize;
    const worldHeight = this.mapRows * this.tileSize;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // HUD com coordenadas e instruções
    this.hudText = this.add.text(4, 4, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#000000bb',
      padding: { x: 4, y: 2 }
    }).setScrollFactor(0).setDepth(1000);

    // Evento de retorno da batalha (resume)
    this.events.on('resume', () => {
      this.cameras.main.fadeIn(400, 0, 0, 0);
      this.time.delayedCall(450, () => {
        if (this.player) {
          this.player.setLocked(false);
        }
      });
    });
  }

  /**
   * Constrói e renderiza as camadas do mapa de Pallet Town
   */
  buildTiledMap() {
    PalletTownMap.layers.forEach(layer => {
      const isBuildingLayer = layer.name === 'Buildings';
      const isGrassLayer = layer.name === 'TallGrass';

      for (let row = 0; row < this.mapRows; row++) {
        for (let col = 0; col < this.mapCols; col++) {
          const tileIndex = row * this.mapCols + col;
          const tileId = layer.data[tileIndex];

          if (tileId === 0) continue; // Tile vazio/transparente

          const tileDef = TILE_ID_MAP[tileId];
          if (!tileDef) continue;

          const px = col * this.tileSize;
          const py = row * this.tileSize;

          // Define profundidade (edifícios e árvores têm profundidade conforme Y)
          const depth = isBuildingLayer ? row + 2 : 0;
          this.add.image(px, py, tileDef.texture).setOrigin(0, 0).setDepth(depth);

          if (tileDef.solid) {
            this.collisionGrid[row][col] = 1;
          }

          if (tileDef.isTallGrass || isGrassLayer) {
            this.tallGrassGrid[row][col] = true;
          }
        }
      }
    });
  }

  /**
   * Verifica colisão física
   */
  isWalkable(x, y) {
    if (x < 0 || x >= this.mapCols || y < 0 || y >= this.mapRows) {
      return false;
    }
    return this.collisionGrid[y][x] === 0;
  }

  /**
   * Verifica se o tile contém grama alta
   */
  isTallGrass(x, y) {
    if (x < 0 || x >= this.mapCols || y < 0 || y >= this.mapRows) return false;
    return this.tallGrassGrid[y][x] === true;
  }

  /**
   * Disparado quando o jogador conclui um passo em um novo tile
   */
  onPlayerStep(gridX, gridY) {
    // Efeito de partículas/grama se pisar em grama alta
    if (this.isTallGrass(gridX, gridY)) {
      this.spawnGrassRustle(gridX, gridY);

      // Testa se engatilha batalha selvagem
      const wildPokemon = this.grassEncounter.checkEncounter(gridX, gridY, (x, y) => this.isTallGrass(x, y));

      if (wildPokemon) {
        this.triggerWildBattle(wildPokemon);
      }
    }
  }

  /**
   * Efeito visual da grama sacudindo ao pisar
   */
  spawnGrassRustle(gridX, gridY) {
    const px = gridX * this.tileSize + this.tileSize / 2;
    const py = gridY * this.tileSize + this.tileSize / 2;

    const rustle = this.add.circle(px, py + 2, 4, 0x4caf50, 0.7).setDepth(gridY + 1);
    this.tweens.add({
      targets: rustle,
      scaleX: 1.6,
      scaleY: 0.6,
      alpha: 0,
      duration: 180,
      onComplete: () => rustle.destroy()
    });
  }

  /**
   * Inicia a transição dramática e troca para a BattleScene
   */
  triggerWildBattle(wildPokemon) {
    this.player.setLocked(true);

    this.grassEncounter.playBattleTransition(() => {
      this.scene.pause('WorldScene');
      this.scene.launch('BattleScene', {
        playerPokemon: this.playerPokemon,
        wildPokemon: wildPokemon
      });
    });
  }

  update() {
    if (this.player) {
      this.player.update();

      const pos = this.player.getPosition();
      const onGrass = this.isTallGrass(pos.x, pos.y);
      this.hudText.setText(`POS: [${pos.x}, ${pos.y}] | ${onGrass ? '🌿 GRAMA ALTA' : 'ESTRADA'} | DIR: ${this.player.facing.toUpperCase()}`);
    }
  }
}
