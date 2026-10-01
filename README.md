# 🔴 Pokémon Fire Red - Remake Web RPG 2D

Projeto de remake em JavaScript e **Phaser 3** de um RPG 2D de captura de monstros e batalhas por turnos, inspirado na mecânica clássica de **Pokémon Fire Red (GBA)**.

---

## 🎮 Funcionalidades Implementadas

- 🟩 **Renderização Pixel Art Fiel**: Resolução nativa GBA de 240x160 com escala 3x e `pixelArt: true`.
- 🚶 **Movimentação em Grade (Tile/Grid-based)**:
  - Deslocamento de 16x16 pixels por passo com interpolação suave (*Tweens*).
  - Controle em 4 direções com trava de entrada durante o passo.
  - Corrida com tênis (*Running Shoes*) segurando `Shift`.
  - Efeito tátil de impacto (*Bump*) contra paredes e árvores.
- 🗺️ **Milestone 6 - Mapa Pallet Town via Tiled JSON**:
  - Camadas ortogonais modulares: Terreno (*Ground*), Construções sólidas (*Buildings* com telhados e portas) e Grama Alta (*TallGrass*).
  - Matriz de colisão calculada a partir dos atributos dos tiles.
- 🌿 **Milestone 7 - Sistema de Encontros Selvagens**:
  - Detecção a cada passo em tiles de grama alta com efeito de folha sacudindo.
  - Sorteio randômico ponderado baseado na tabela de rotas da Rota 1 (Pidgey e Rattata de Nv. 2 a 4).
  - Transição de tela clássica com flash e persianas deslizantes.
- ⚔️ **Milestone 8 - Batalha por Turnos Estilo Fire Red**:
  - Plataformas de combate para o Pokémon selvagem e o Pokémon do jogador (Charmander Nv. 5).
  - Barras de HP animadas dinâmicas (verde > amarelo > vermelho).
  - Caixa de comando com navegação por teclado e mouse: `[LUTAR]`, `[MOCHILA]`, `[POKÉMON]`, `[FUGIR]`.
  - Submenu de golpes com Tipo e contagem de PP.
  - Ordem de ataque por velocidade, cálculo de dano, desmaio e retorno fluido ao mapa.

---

## 📂 Estrutura de Diretórios

```text
fire-red-js/
├── index.html                  # Shell HTML5 responsivo
├── main.js                     # Inicialização das cenas do Phaser
├── .gitignore                  # Arquivos ignorados pelo Git
├── README.md                   # Documentação técnica do projeto
└── src/
    ├── config.js               # Constantes de resolução GBA, tiles e tempos
    ├── data/
    │   ├── maps/
    │   │   ├── palletTown.json # Arquivo de mapa no padrão Tiled Map Editor
    │   │   └── palletTownMap.js# Módulo JS do mapa para carregamento nativo
    │   └── pokemonData.js      # Espécies, stats base, golpes e encontros
    ├── entities/
    │   ├── Player.js           # Física em grade, estados de movimento e colisões
    │   └── GrassEncounter.js   # Sistema de probabilidade e transição de batalha
    └── scenes/
        ├── BootScene.js        # Geração de texturas procedurais retrô (Red, Pokémon, Tiles)
        ├── WorldScene.js       # Exploração de Pallet Town e gerenciamento de passos
        └── BattleScene.js      # Cena de batalha por turnos com interface GBA
```

---

## 🕹️ Controles

| Modo | Ação | Teclas |
| :--- | :--- | :--- |
| **Exploração** | Mover | Setas direcionais ou `W`, `A`, `S`, `D` |
| **Exploração** | Correr | Segurar `Shift` enquanto anda |
| **Batalha** | Selecionar opção | Setas / `WASD` ou Clique do Mouse |
| **Batalha** | Confirmar ação/golpe | `Enter`, `Espaço` ou `Z` |
| **Batalha** | Voltar ao menu | `Escape`, `Backspace` ou `X` |

---

## 🗺️ Roadmap de Desenvolvimento (Milestones)

1. **Milestone 1**: Boilerplate básico e inicialização da engine com canvas pixel art.
2. **Milestone 2**: Sistema de movimentação em grid 16x16 com 4 direções e prevenção de desvio.
3. **Milestone 3**: Carregamento de Tilemaps reais via Tiled (.json) e camadas de colisão.
4. **Milestone 4**: Sistema de Encontros Selvagens (Grama alta com probabilidade e transição de tela).
5. **Milestone 5**: Máquina de Estados da Batalha por Turnos (Interface de combate, HP e comandos).
6. **Milestone 6**: Banco de dados de Pokémons, golpes e cálculo de dano da Geração III.
