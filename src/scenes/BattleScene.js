import { GameConfig } from '../config.js';
import { createPokemonInstance } from '../data/pokemonData.js';

/**
 * Cena de Batalha por Turnos no estilo clássico do Pokémon Fire Red (GBA).
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.playerPokemon = data.playerPokemon || createPokemonInstance('charmander', 5);
    this.wildPokemon = data.wildPokemon || createPokemonInstance('pidgey', 3);

    // Estados da Batalha
    this.state = 'INTRO'; // INTRO | ACTION_SELECT | MOVE_SELECT | EXECUTING_TURN | BATTLE_OVER
    this.selectedActionIndex = 0; // 0: Lutar, 1: Mochila, 2: Pokémon, 3: Fugir
    this.selectedMoveIndex = 0;
  }

  create() {
    const { NATIVE_WIDTH, NATIVE_HEIGHT } = GameConfig;

    // 1. Fundo do Cenário
    this.add.image(0, 0, 'battle_bg').setOrigin(0, 0);

    // 2. Plataformas dos Pokémon
    this.enemyPlatform = this.add.image(180, 58, 'battle_platform').setScale(0.85);
    this.playerPlatform = this.add.image(60, 96, 'battle_platform').setScale(0.95);

    // 3. Sprites dos Pokémon
    const enemyTexture = `pokemon_${this.wildPokemon.speciesId}_front`;
    this.enemySprite = this.add.sprite(180, 48, this.textures.exists(enemyTexture) ? enemyTexture : 'pokemon_pidgey_front');
    this.enemySprite.setOrigin(0.5, 0.7);

    const playerTexture = `pokemon_${this.playerPokemon.speciesId}_back`;
    this.playerSprite = this.add.sprite(60, 84, this.textures.exists(playerTexture) ? playerTexture : 'pokemon_charmander_back');
    this.playerSprite.setOrigin(0.5, 0.7);

    // 4. Caixas de Status (HUD de HP)
    this.createEnemyHud();
    this.createPlayerHud();

    // 5. Caixa de Diálogo Inferior clássica
    this.createDialogAndMenuBox();

    // 6. Controles de Teclado
    this.setupInputHandlers();

    // 7. Inicia com a animação de introdução
    this.playIntro();
  }

  /**
   * HUD do Pokémon Selvagem (Nome, Nível, Barra de Vida)
   */
  createEnemyHud() {
    this.enemyHudContainer = this.add.container(10, 10);

    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, 104, 28, 4);
    bg.lineStyle(1, 0x383838, 1);
    bg.strokeRoundedRect(0, 0, 104, 28, 4);

    const nameText = this.add.text(6, 4, this.wildPokemon.name.toUpperCase(), {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#212121',
      fontStyle: 'bold'
    });

    const lvText = this.add.text(80, 4, `Nv${this.wildPokemon.level}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#555555'
    });

    const hpLabel = this.add.text(6, 16, 'HP:', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#e53935',
      fontStyle: 'bold'
    });

    // Barra de fundo do HP (cinza)
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x757575, 1);
    hpBg.fillRect(24, 17, 72, 5);

    // Barra viva de HP (verde)
    this.enemyHpBar = this.add.graphics();
    this.updateHpBar(this.enemyHpBar, 24, 17, 72, 5, this.wildPokemon.currentHp, this.wildPokemon.maxHp);

    this.enemyHudContainer.add([bg, nameText, lvText, hpLabel, hpBg, this.enemyHpBar]);
  }

  /**
   * HUD do Pokémon do Jogador
   */
  createPlayerHud() {
    this.playerHudContainer = this.add.container(126, 68);

    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, 108, 38, 4);
    bg.lineStyle(1, 0x383838, 1);
    bg.strokeRoundedRect(0, 0, 108, 38, 4);

    const nameText = this.add.text(6, 4, this.playerPokemon.name.toUpperCase(), {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#212121',
      fontStyle: 'bold'
    });

    const lvText = this.add.text(82, 4, `Nv${this.playerPokemon.level}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#555555'
    });

    const hpLabel = this.add.text(6, 16, 'HP:', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#e53935',
      fontStyle: 'bold'
    });

    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x757575, 1);
    hpBg.fillRect(24, 17, 76, 5);

    this.playerHpBar = this.add.graphics();
    this.updateHpBar(this.playerHpBar, 24, 17, 76, 5, this.playerPokemon.currentHp, this.playerPokemon.maxHp);

    this.playerHpText = this.add.text(48, 25, `${this.playerPokemon.currentHp}/ ${this.playerPokemon.maxHp}`, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#333333'
    });

    this.playerHudContainer.add([bg, nameText, lvText, hpLabel, hpBg, this.playerHpBar, this.playerHpText]);
  }

  /**
   * Desenha a barra de vida colorida conforme a porcentagem
   */
  updateHpBar(graphicsObj, x, y, width, height, current, max) {
    graphicsObj.clear();
    const ratio = Math.max(0, current / max);
    let color = 0x4caf50; // Verde

    if (ratio <= 0.2) {
      color = 0xe53935; // Vermelho
    } else if (ratio <= 0.5) {
      color = 0xfbc02d; // Amarelo
    }

    graphicsObj.fillStyle(color, 1);
    graphicsObj.fillRect(x, y, Math.floor(width * ratio), height);
  }

  /**
   * Cria a caixa de mensagem e botões na área inferior
   */
  createDialogAndMenuBox() {
    const boxY = 112;
    const boxH = 48;

    // Fundo da caixa estilo GBA (Azul escuro com borda dupla)
    const box = this.add.graphics();
    box.fillStyle(0x212121, 1);
    box.fillRect(0, boxY, GameConfig.NATIVE_WIDTH, boxH);
    box.lineStyle(2, 0xe0e0e0, 1);
    box.strokeRect(2, boxY + 2, GameConfig.NATIVE_WIDTH - 4, boxH - 4);

    // Texto de narração / diálogo
    this.dialogText = this.add.text(10, boxY + 12, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffffff',
      wordWrap: { width: 140 }
    });

    // Painel de Ações 2x2: [LUTAR] [MOCHILA] / [POKÉMON] [FUGIR]
    this.actionMenuContainer = this.add.container(152, boxY + 6);
    this.actionButtons = [];

    const actions = ['LUTAR', 'MOCHILA', 'POKÉMON', 'FUGIR'];
    const positions = [
      { x: 0, y: 4 },
      { x: 44, y: 4 },
      { x: 0, y: 22 },
      { x: 44, y: 22 }
    ];

    actions.forEach((label, idx) => {
      const btn = this.add.text(positions[idx].x, positions[idx].y, label, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#aaaaaa'
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.selectedActionIndex = idx;
        this.confirmAction();
      });

      this.actionButtons.push(btn);
      this.actionMenuContainer.add(btn);
    });

    this.actionMenuContainer.setVisible(false);

    // Submenu de Golpes (4 golpes)
    this.moveMenuContainer = this.add.container(10, boxY + 6);
    this.moveButtons = [];

    const movePositions = [
      { x: 0, y: 4 },
      { x: 80, y: 4 },
      { x: 0, y: 22 },
      { x: 80, y: 22 }
    ];

    for (let i = 0; i < 4; i++) {
      const mText = this.add.text(movePositions[i].x, movePositions[i].y, '-', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#aaaaaa'
      }).setInteractive({ useHandCursor: true });

      const idx = i;
      mText.on('pointerdown', () => {
        this.selectedMoveIndex = idx;
        this.confirmMove();
      });

      this.moveButtons.push(mText);
      this.moveMenuContainer.add(mText);
    }

    this.moveInfoText = this.add.text(160, boxY + 12, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#38bdf8'
    });

    this.moveMenuContainer.add(this.moveInfoText);
    this.moveMenuContainer.setVisible(false);
  }

  setupInputHandlers() {
    this.input.keyboard.on('keydown', (event) => {
      if (this.state === 'ACTION_SELECT') {
        this.handleActionNavigation(event.key);
      } else if (this.state === 'MOVE_SELECT') {
        this.handleMoveNavigation(event.key);
      }
    });
  }

  handleActionNavigation(key) {
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      if (this.selectedActionIndex % 2 === 0) this.selectedActionIndex += 1;
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      if (this.selectedActionIndex % 2 === 1) this.selectedActionIndex -= 1;
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      if (this.selectedActionIndex < 2) this.selectedActionIndex += 2;
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      if (this.selectedActionIndex >= 2) this.selectedActionIndex -= 2;
    } else if (key === 'Enter' || key === ' ' || key === 'z' || key === 'Z') {
      this.confirmAction();
      return;
    }

    this.refreshMenuHighlights();
  }

  handleMoveNavigation(key) {
    const moveCount = this.playerPokemon.moves.length;

    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      if (this.selectedMoveIndex % 2 === 0 && this.selectedMoveIndex + 1 < moveCount) {
        this.selectedMoveIndex += 1;
      }
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      if (this.selectedMoveIndex % 2 === 1) this.selectedMoveIndex -= 1;
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      if (this.selectedMoveIndex + 2 < moveCount) this.selectedMoveIndex += 2;
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      if (this.selectedMoveIndex >= 2) this.selectedMoveIndex -= 2;
    } else if (key === 'Escape' || key === 'x' || key === 'X' || key === 'Backspace') {
      // Volta para o menu de ações
      this.openActionMenu();
      return;
    } else if (key === 'Enter' || key === ' ' || key === 'z' || key === 'Z') {
      this.confirmMove();
      return;
    }

    this.refreshMoveHighlights();
  }

  refreshMenuHighlights() {
    this.actionButtons.forEach((btn, idx) => {
      if (idx === this.selectedActionIndex) {
        btn.setColor('#ff4757').setText(`▶ ${btn.text.replace('▶ ', '')}`);
      } else {
        btn.setColor('#aaaaaa').setText(btn.text.replace('▶ ', ''));
      }
    });
  }

  refreshMoveHighlights() {
    const moves = this.playerPokemon.moves;
    this.moveButtons.forEach((btn, idx) => {
      const move = moves[idx];
      if (move) {
        btn.setVisible(true);
        if (idx === this.selectedMoveIndex) {
          btn.setColor('#ff4757').setText(`▶ ${move.name}`);
          this.moveInfoText.setText(`PP ${move.currentPp}/${move.maxPp}\nTIPO/${move.type.toUpperCase()}`);
        } else {
          btn.setColor('#ffffff').setText(move.name);
        }
      } else {
        btn.setVisible(false);
      }
    });
  }

  playIntro() {
    this.dialogText.setText(`Um ${this.wildPokemon.name.toUpperCase()}\nselvagem apareceu!`);

    this.time.delayedCall(1600, () => {
      this.dialogText.setText(`Vai, ${this.playerPokemon.name.toUpperCase()}!`);
      this.time.delayedCall(1200, () => {
        this.openActionMenu();
      });
    });
  }

  openActionMenu() {
    this.state = 'ACTION_SELECT';
    this.dialogText.setText(`O que ${this.playerPokemon.name.toUpperCase()}\ndeve fazer?`);
    this.moveMenuContainer.setVisible(false);
    this.actionMenuContainer.setVisible(true);
    this.refreshMenuHighlights();
  }

  openMoveMenu() {
    this.state = 'MOVE_SELECT';
    this.actionMenuContainer.setVisible(false);
    this.moveMenuContainer.setVisible(true);
    this.refreshMoveHighlights();
  }

  confirmAction() {
    if (this.state !== 'ACTION_SELECT') return;

    if (this.selectedActionIndex === 0) {
      // LUTAR
      this.openMoveMenu();
    } else if (this.selectedActionIndex === 1) {
      // MOCHILA
      this.dialogText.setText('Mochila vazia no momento!');
      this.time.delayedCall(1000, () => this.openActionMenu());
    } else if (this.selectedActionIndex === 2) {
      // POKÉMON
      this.dialogText.setText('Você só possui um Pokémon!');
      this.time.delayedCall(1000, () => this.openActionMenu());
    } else if (this.selectedActionIndex === 3) {
      // FUGIR
      this.state = 'BATTLE_OVER';
      this.actionMenuContainer.setVisible(false);
      this.dialogText.setText('Você fugiu com segurança!');
      this.time.delayedCall(1200, () => {
        this.endBattle();
      });
    }
  }

  confirmMove() {
    if (this.state !== 'MOVE_SELECT') return;

    const chosenMove = this.playerPokemon.moves[this.selectedMoveIndex];
    if (!chosenMove || chosenMove.currentPp <= 0) {
      this.dialogText.setText('Sem PP suficiente para este golpe!');
      return;
    }

    this.state = 'EXECUTING_TURN';
    this.moveMenuContainer.setVisible(false);

    // Seleciona um golpe do inimigo aleatório
    const enemyMove = this.wildPokemon.moves[Math.floor(Math.random() * this.wildPokemon.moves.length)];

    // Executa os turnos por ordem de velocidade
    this.executeCombatRound(chosenMove, enemyMove);
  }

  executeCombatRound(playerMove, enemyMove) {
    const playerFirst = this.playerPokemon.speed >= this.wildPokemon.speed;

    const turn1 = playerFirst
      ? () => this.executeAttack(this.playerPokemon, this.wildPokemon, playerMove, this.playerSprite, this.enemySprite, this.enemyHpBar, () => {
          if (this.wildPokemon.currentHp <= 0) {
            this.handleEnemyFaint();
          } else {
            this.executeAttack(this.wildPokemon, this.playerPokemon, enemyMove, this.enemySprite, this.playerSprite, this.playerHpBar, () => {
              if (this.playerPokemon.currentHp <= 0) {
                this.handlePlayerFaint();
              } else {
                this.openActionMenu();
              }
            });
          }
        })
      : () => this.executeAttack(this.wildPokemon, this.playerPokemon, enemyMove, this.enemySprite, this.playerSprite, this.playerHpBar, () => {
          if (this.playerPokemon.currentHp <= 0) {
            this.handlePlayerFaint();
          } else {
            this.executeAttack(this.playerPokemon, this.wildPokemon, playerMove, this.playerSprite, this.enemySprite, this.enemyHpBar, () => {
              if (this.wildPokemon.currentHp <= 0) {
                this.handleEnemyFaint();
              } else {
                this.openActionMenu();
              }
            });
          }
        });

    turn1();
  }

  executeAttack(attacker, defender, move, attackerSprite, defenderSprite, defenderHpBar, onComplete) {
    this.dialogText.setText(`${attacker.name.toUpperCase()} usou\n${move.name.toUpperCase()}!`);

    // Animação de avanço do atacante
    const originalX = attackerSprite.x;
    const forwardX = attackerSprite === this.playerSprite ? originalX + 8 : originalX - 8;

    this.tweens.add({
      targets: attackerSprite,
      x: forwardX,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        // Efeito de piscar do defensor ao receber o dano
        this.tweens.add({
          targets: defenderSprite,
          alpha: 0.2,
          duration: 60,
          repeat: 3,
          yoyo: true,
          onComplete: () => {
            // Cálculo de dano Pokémon clássico
            const damage = Math.max(1, Math.floor(((2 * attacker.level / 5 + 2) * move.power * (attacker.attack / defender.defense)) / 50) + 2);
            defender.currentHp = Math.max(0, defender.currentHp - damage);

            // Animação da redução de HP
            const isEnemy = defender === this.wildPokemon;
            const barX = 24;
            const barY = 17;
            const barW = isEnemy ? 72 : 76;
            const barH = 5;

            this.updateHpBar(defenderHpBar, barX, barY, barW, barH, defender.currentHp, defender.maxHp);

            if (!isEnemy && this.playerHpText) {
              this.playerHpText.setText(`${defender.currentHp}/ ${defender.maxHp}`);
            }

            this.time.delayedCall(900, () => {
              if (onComplete) onComplete();
            });
          }
        });
      }
    });
  }

  handleEnemyFaint() {
    this.dialogText.setText(`${this.wildPokemon.name.toUpperCase()} selvagem\ndesmaiou!`);

    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y + 20,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(800, () => {
          this.dialogText.setText(`Charmander ganhou\n42 pontos de EXP!`);
          this.time.delayedCall(1400, () => {
            this.endBattle();
          });
        });
      }
    });
  }

  handlePlayerFaint() {
    this.dialogText.setText(`${this.playerPokemon.name.toUpperCase()} desmaiou!`);
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.dialogText.setText('Você correu para o Centro Pokémon mais próximo...');
          this.playerPokemon.currentHp = this.playerPokemon.maxHp; // Cura ao voltar
          this.time.delayedCall(1500, () => {
            this.endBattle();
          });
        });
      }
    });
  }

  endBattle() {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(450, () => {
      this.scene.stop('BattleScene');
      this.scene.resume('WorldScene');
    });
  }
}
