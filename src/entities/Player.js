import { GameConfig } from '../config.js';

/**
 * Entidade do Jogador com movimentação baseada em grade (Grid/Tile-based Movement)
 * fiel ao comportamento do Pokémon Fire Red (GBA).
 */
export class Player {
  /**
   * @param {Phaser.Scene} scene - Cena atual do Phaser
   * @param {number} startGridX - Coordenada X inicial na grade
   * @param {startGridY} startGridY - Coordenada Y inicial na grade
   * @param {Function} [isWalkableCallback] - Função de verificação de colisão (gridX, gridY) => boolean
   */
  constructor(scene, startGridX = 7, startGridY = 5, isWalkableCallback = null, onStepComplete = null) {
    this.scene = scene;
    this.tileSize = GameConfig.TILE_SIZE;

    // Coordenadas lógicas do Grid
    this.gridX = startGridX;
    this.gridY = startGridY;

    // Orientação e Estados
    this.facing = 'down';
    this.isMoving = false;
    this.isLocked = false; // Trava o personagem para diálogos e transições de batalha
    this.isWalkable = isWalkableCallback || (() => true);
    this.onStepComplete = onStepComplete || (() => {});

    // Criação do Sprite do Jogador centralizado no tile
    // Anchor / Origem em (0.5, 0.5) com deslocamento no centro do tile
    const pixelX = this.gridX * this.tileSize + this.tileSize / 2;
    const pixelY = this.gridY * this.tileSize + this.tileSize / 2;

    this.sprite = scene.add.sprite(pixelX, pixelY, 'player_down');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(10); // Renderizado sobre o chão

    // Configuração dos controles de teclado
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    // Alternador de pernas para efeito de caminhada (perna esquerda/direita)
    this.stepFoot = false;
  }

  /**
   * Ciclo de atualização chamado a cada frame pela Scene.
   */
  update() {
    if (this.isMoving || this.isLocked) {
      return; // Bloqueia novos comandos enquanto um passo de tile estiver em execução ou locked
    }

    const direction = this.getDirectionInput();

    if (direction) {
      this.handleMovement(direction);
    }
  }

  /**
   * Bloqueia ou desbloqueia as ações e movimentações do jogador.
   * @param {boolean} locked
   */
  setLocked(locked) {
    this.isLocked = locked;
    if (locked) {
      this.updateSpriteFrame(false);
    }
  }

  /**
   * Captura o input direcional ativo do jogador.
   * @returns {object|null} Vetor de direção ou null
   */
  getDirectionInput() {
    const { DIRECTIONS } = GameConfig;

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      return DIRECTIONS.UP;
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      return DIRECTIONS.DOWN;
    }
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      return DIRECTIONS.LEFT;
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      return DIRECTIONS.RIGHT;
    }

    return null;
  }

  /**
   * Processa a rotação de face e o avanço no grid com tweening.
   * @param {object} direction - Objeto da direção selecionada
   */
  handleMovement(direction) {
    // 1. Atualiza a direção visual para onde o personagem olha
    this.facing = direction.name;
    this.updateSpriteFrame(false);

    // 2. Calcula as coordenadas do tile de destino
    const targetGridX = this.gridX + direction.x;
    const targetGridY = this.gridY + direction.y;

    // 3. Testa colisão do tile de destino
    if (!this.isWalkable(targetGridX, targetGridY)) {
      // Pequeno efeito visual de bump se colidir com parede/borda
      this.playBumpFeedback(direction);
      return;
    }

    // 4. Inicia o movimento suave (Grid Tween)
    this.isMoving = true;
    this.stepFoot = !this.stepFoot;
    this.updateSpriteFrame(true);

    const isRunning = this.cursors.shift?.isDown || this.wasd.shift.isDown;
    const duration = isRunning ? GameConfig.RUN_DURATION : GameConfig.WALK_DURATION;

    const targetPixelX = targetGridX * this.tileSize + this.tileSize / 2;
    const targetPixelY = targetGridY * this.tileSize + this.tileSize / 2;

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetPixelX,
      y: targetPixelY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        // Conclusão do passo: atualiza os índices lógicos
        this.gridX = targetGridX;
        this.gridY = targetGridY;
        this.isMoving = false;

        // Retorna para o frame idle
        this.updateSpriteFrame(false);

        // Atualiza a profundidade em relação ao mapa
        this.sprite.setDepth(this.gridY + 10);

        // Notifica listeners externos (ex: checagem de grama alta para encontros)
        this.onStepComplete(this.gridX, this.gridY);
      }
    });
  }

  /**
   * Altera a textura do sprite de acordo com a direção e estado de movimento.
   * @param {boolean} isWalking
   */
  updateSpriteFrame(isWalking) {
    const footSuffix = isWalking ? (this.stepFoot ? '_walk1' : '_walk2') : '';
    const textureKey = `player_${this.facing}${footSuffix}`;

    if (this.scene.textures.exists(textureKey)) {
      this.sprite.setTexture(textureKey);
    } else if (this.scene.textures.exists(`player_${this.facing}`)) {
      this.sprite.setTexture(`player_${this.facing}`);
    }
  }

  /**
   * Leve animação elástica ao tentar andar contra uma barreira.
   * @param {object} direction
   */
  playBumpFeedback(direction) {
    if (this.isBumping) return;
    this.isBumping = true;

    const offsetDist = 2;
    const originalX = this.sprite.x;
    const originalY = this.sprite.y;

    this.scene.tweens.add({
      targets: this.sprite,
      x: originalX + direction.x * offsetDist,
      y: originalY + direction.y * offsetDist,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        this.sprite.x = originalX;
        this.sprite.y = originalY;
        this.isBumping = false;
      }
    });
  }

  /**
   * Retorna a posição em tiles para eventos (grama alta, portas, NPCs)
   */
  getPosition() {
    return { x: this.gridX, y: this.gridY };
  }
}
