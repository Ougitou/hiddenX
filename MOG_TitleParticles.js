//=============================================================================
// MOG_TitleParticles.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v3.0) Adiciona partículas em qualquer cena com configurações únicas.
 * @author Moghunter, odeslat
 * @url https://atelierrgss.wordpress.com
 *
 * @param Scenes
 * @desc Lista de cenas para ativar as partículas.
 * @default ["{\"Scene\":\"Scene_Title\",\"P1_Visible\":\"true\",\"P1_File_Name\":\"Particles\",\"P1_Amount\":\"25\",\"P1_X_Speed\":\"-10\",\"P1_Y_Speed\":\"-1\",\"P1_Rotation_Speed\":\"0.02\",\"P1_Blend_Mode\":\"1\",\"P1_Anchor\":\"0\",\"P1_Leaf_Mode\":\"false\",\"P1_Transition_Time\":\"0\",\"P1_Mode\":\"0\",\"P2_Visible\":\"true\",\"P2_File_Name\":\"Particles2\",\"P2_Amount\":\"5\",\"P2_X_Speed\":\"2\",\"P2_Y_Speed\":\"2\",\"P2_Rotation_Speed\":\"0.01\",\"P2_Blend_Mode\":\"0\",\"P2_Anchor\":\"0\",\"P2_Leaf_Mode\":\"false\",\"P2_Transition_Time\":\"0\",\"P2_Mode\":\"0\",\"P3_Visible\":\"true\",\"P3_File_Name\":\"Particles3\",\"P3_Amount\":\"5\",\"P3_X_Speed\":\"0.5\",\"P3_Y_Speed\":\"0.5\",\"P3_Rotation_Speed\":\"0.006\",\"P3_Blend_Mode\":\"0\",\"P3_Anchor\":\"0\",\"P3_Leaf_Mode\":\"true\",\"P3_Transition_Time\":\"0\",\"P3_Mode\":\"0\",\"P4_Visible\":\"false\",\"P4_File_Name\":\"Particles4\",\"P4_Amount\":\"25\",\"P4_X_Speed\":\"2\",\"P4_Y_Speed\":\"0.3\",\"P4_Rotation_Speed\":\"0.3\",\"P4_Blend_Mode\":\"1\",\"P4_Anchor\":\"0\",\"P4_Leaf_Mode\":\"true\",\"P4_Transition_Time\":\"0\",\"P4_Mode\":\"0\",\"P5_Visible\":\"false\",\"P5_File_Name\":\"Particles5\",\"P5_Amount\":\"25\",\"P5_X_Speed\":\"4\",\"P5_Y_Speed\":\"0\",\"P5_Rotation_Speed\":\"0\",\"P5_Blend_Mode\":\"1\",\"P5_Anchor\":\"0\",\"P5_Leaf_Mode\":\"false\",\"P5_Transition_Time\":\"0\",\"P5_Mode\":\"0\",\"P6_Visible\":\"false\",\"P6_File_Name\":\"Particles6\",\"P6_Amount\":\"25\",\"P6_X_Speed\":\"4\",\"P6_Y_Speed\":\"0\",\"P6_Rotation_Speed\":\"0\",\"P6_Blend_Mode\":\"1\",\"P6_Anchor\":\"0\",\"P6_Leaf_Mode\":\"false\",\"P6_Transition_Time\":\"0\",\"P6_Mode\":\"0\"}"]
 * @type struct<SceneParticles>[]
 *
 * @help
 * =============================================================================
 * +++ MOG - Scene Particles (v3.0) +++
 * By Moghunter, odeslat
 * https://atelierrgss.wordpress.com/
 * =============================================================================
 * Adiciona partículas em qualquer cena com configurações únicas.
 *
 * Grave as imagens na pasta.
 *
 * img/titles2/
 *
 * =============================================================================
 * ** NOVOS RECURSOS **
 * =============================================================================
 * - As partículas agora podem ser configuradas por cena.
 * - As partículas agora podem cruzar entre o fundo e o primeiro plano.
 * - As partículas agora têm um efeito de desfoque que aumenta à medida que
 *   ficam menores ou mais profundas no eixo z.
 * =============================================================================
 * ** MODOS DE ANIMAÇÃO **
 * =============================================================================
 * 0 - Default: O modo padrão do plugin.
 * 1 - Pulse: A partícula pulsa, aumentando e diminuindo de tamanho.
 * 2 - Flicker: A partícula pisca, alterando sua opacidade aleatoriamente.
 * 3 - Wave: A partícula se move em um padrão de onda.
 * 4 - Spiral: A partícula se move em um padrão de espiral.
 * 5 - Explode: A partícula explode do centro da tela.
 * 6 - Fall: A partícula cai lentamente.
 * 7 - Rise: A partícula sobe lentamente.
 * 8 - Orbit: A partícula orbita o centro da tela.
 * 9 - Bounce: A partícula quica nas bordas da tela.
 * 10 - Zigzag: A partícula se move em ziguezague.
 * 11 - Random Walk: A partícula se move aleatoriamente pela tela.
 * 12 - Rain: A partícula cai como chuva.
 * 13 - Snow: A partícula cai como neve.
 * 14 - Meteor: A partícula se move rapidamente pela tela como um meteoro.
 * 15 - Vortex: A partícula é sugada para o centro da tela.
 * 16 - Twirl: A partícula gira.
 * 17 - Gravity: A partícula é afetada pela gravidade.
 * 18 - Anti-Gravity: A partícula é afetada pela anti-gravidade.
 * 19 - Shrink: A partícula diminui de tamanho até desaparecer.
 * 20 - Grow: A partícula aumenta de tamanho a partir do nada.
 * =============================================================================
 * * HISTORICO
 * =============================================================================
 * (v3.0) - Adicionado suporte para configurações de partículas por cena.
 * (v2.0) - O plugin foi generalizado para poder adicionar partículas
 *          a qualquer cena.
 * (v1.2) - Correção na função sort relativo a codificação.
 * (v1.1) - Melhoria no plugin parameter na seleção de arquivos.
 *
 */
/*~struct~SceneParticles:
 *
 * @param Scene
 * @desc Nome da cena.
 * @type string
 *
 * @param -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P1 Visible
 * @desc Ativar partícula.
 * @default true
 * @type boolean
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 File Name
 * @desc Nome do arquivo.
 * @default Particles
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Amount
 * @desc Quantidade de partículas.
 * @default 25
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 X Speed
 * @desc Velocidade X-Axis.
 * @default -10
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Y Speed
 * @desc Velocidade Y-Axis.
 * @default -1
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0.02
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Blend Mode
 * @desc Definição de blend.
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Leaf Mode
 * @desc Ativar animação de folha.
 * @default false
 * @type boolean
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P1 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 1 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P2 Visible
 * @desc Ativar partícula.
 * @default true
 * @type boolean
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 File Name
 * @desc Nome do arquivo.
 * @default Particles2
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Amount
 * @desc Quantidade de partículas.
 * @default 5
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 X Speed
 * @desc Velocidade X-Axis.
 * @default 2
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Y Speed
 * @desc Velocidade Y-Axis.
 * @default 2
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0.01
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Blend Mode
 * @desc Definição de blend.
 * @default 0
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Leaf Mode
 * @desc Ativar animação de folha.
 * @default false
 * @type boolean
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P2 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 2 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P3 Visible
 * @desc Ativar partícula.
 * @default true
 * @type boolean
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 File Name
 * @desc Nome do arquivo.
 * @default Particles3
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Amount
 * @desc Quantidade de partículas.
 * @default 5
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 X Speed
 * @desc Velocidade X-Axis.
 * @default 0.5
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Y Speed
 * @desc Velocidade Y-Axis.
 * @default 0.5
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0.006
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Blend Mode
 * @desc Definição de blend.
 * @default 0
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Leaf Mode
 * @desc Ativar animação de folha.
 * @default true
 * @type boolean
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P3 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 3 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P4 Visible
 * @desc Ativar partícula.
 * @default false
 * @type boolean
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 File Name
 * @desc Nome do arquivo.
 * @default Particles4
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Amount
 * @desc Quantidade de partículas.
 * @default 25
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 X Speed
 * @desc Velocidade X-Axis.
 * @default 2
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Y Speed
 * @desc Velocidade Y-Axis.
 * @default 0.3
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0.3
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Blend Mode
 * @desc Definição de blend.
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Leaf Mode
 * @desc Ativar animação de folha.
 * @default true
 * @type boolean
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P4 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 4 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P5 Visible
 * @desc Ativar partícula.
 * @default false
 * @type boolean
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 File Name
 * @desc Nome do arquivo.
 * @default Particles5
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Amount
 * @desc Quantidade de partículas.
 * @default 25
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 X Speed
 * @desc Velocidade X-Axis.
 * @default 4
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Y Speed
 * @desc Velocidade Y-Axis.
 * @default 0
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Blend Mode
 * @desc Definição de blend.
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Leaf Mode
 * @desc Ativar animação de folha.
 * @default false
 * @type boolean
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P5 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 5 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 *
 * @param P6 Visible
 * @desc Ativar partícula.
 * @default false
 * @type boolean
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 File Name
 * @desc Nome do arquivo.
 * @default Particles6
 * @type file
 * @dir img/titles2/
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Amount
 * @desc Quantidade de partículas.
 * @default 25
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 X Speed
 * @desc Velocidade X-Axis.
 * @default 4
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Y Speed
 * @desc Velocidade Y-Axis.
 * @default 0
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Rotation Speed
 * @desc Velocidade de rotação.
 * @default 0
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Blend Mode
 * @desc Definição de blend.
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Add
 * @value 1
 * @option Substract
 * @value 2
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Anchor
 * @desc Definição do anchor.
 * @default 0
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Leaf Mode
 * @desc Ativar animação de folha.
 * @default false
 * @type boolean
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Transition Time
 * @desc Tempo para apresentar a imagem.
 * @default 0
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param P6 Mode
 * @desc Animação da partícula.
 * @default 0
 * @type select
 * @option Default
 * @value 0
 * @option Pulse
 * @value 1
 * @option Flicker
 * @value 2
 * @option Wave
 * @value 3
 * @option Spiral
 * @value 4
 * @option Explode
 * @value 5
 * @option Fall
 * @value 6
 * @option Rise
 * @value 7
 * @option Orbit
 * @value 8
 * @option Bounce
 * @value 9
 * @option Zigzag
 * @value 10
 * @option Random Walk
 * @value 11
 * @option Rain
 * @value 12
 * @option Snow
 * @value 13
 * @option Meteor
 * @value 14
 * @option Vortex
 * @value 15
 * @option Twirl
 * @value 16
 * @option Gravity
 * @value 17
 * @option Anti-Gravity
 * @value 18
 * @option Shrink
 * @value 19
 * @option Grow
 * @value 20
 * @parent -> Particles 6 <<<<<<<<<<<<<<<<<<<<<<<
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
    var Imported = Imported || {};
    Imported.MOG_SceneParticles = true;
　　var Moghunter = Moghunter || {};

  　Moghunter.parameters = PluginManager.parameters('MOG_TitleParticles');
    Moghunter.sceneparticles_scenes = JSON.parse(Moghunter.parameters['Scenes'] || '[]');
	Moghunter.tparticles_M = 6 ;
	Moghunter.tparticles_V = [];	Moghunter.tparticles_F = [];
	Moghunter.tparticles_N = [];	Moghunter.tparticles_X = [];
	Moghunter.tparticles_Y = [];	Moghunter.tparticles_R = [];
	Moghunter.tparticles_B = [];	Moghunter.tparticles_A = [];
	Moghunter.tparticles_L = [];
	Moghunter.tparticles_T = [];
	Moghunter.tparticles_Mode = [];
	for (var i = 0; i < Moghunter.tparticles_M; i++) {
		Moghunter.tparticles_V[i]  = String(Moghunter.parameters['P' + String(i + 1) + " Visible"] || "true");
		Moghunter.tparticles_F[i]  = String(Moghunter.parameters['P' + String(i + 1) + " File Name"] || "Particles");
		Moghunter.tparticles_N[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Amount"] || 25);
		Moghunter.tparticles_X[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " X Speed"] || 0);
		Moghunter.tparticles_Y[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Y Speed"] || -1);
		Moghunter.tparticles_R[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Rotation Speed"] || 0.02);
		Moghunter.tparticles_B[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Blend Mode"] || 1);
		Moghunter.tparticles_A[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Anchor"] || 0);
		Moghunter.tparticles_L[i]  = String(Moghunter.parameters['P' + String(i + 1) + " Leaf Mode"] || "false");
		Moghunter.tparticles_T[i]  = Number(Moghunter.parameters['P' + String(i + 1) + " Transition Time"] || 60);
		Moghunter.tparticles_Mode[i] = Number(Moghunter.parameters['P' + String(i + 1) + " Mode"] || 0);
	};

//=============================================================================
// ■ Scene Base ■
//=============================================================================

//==============================
// ♦ ALIAS ♦  Start
//==============================
var _mog_sceneParticles_start = Scene_Base.prototype.start;
Scene_Base.prototype.start = function() {
	_mog_sceneParticles_start.call(this);
	if (this.canCreateParticles()) {
		this.createParticlesField();
		this.createSceneParticles();
	};
};

//==============================
// * Can Create Particles
//==============================
Scene_Base.prototype.canCreateParticles = function() {
	return this.getSceneParticles();
};

//==============================
// * Get Scene Particles
//==============================
Scene_Base.prototype.getSceneParticles = function() {
    return Moghunter.sceneparticles_scenes.find(function(scene) {
        return scene.Scene === this.constructor.name;
    }, this);
};

//==============================
// * Create Particles Field
//==============================
Scene_Base.prototype.createParticlesField = function() {
    this._particlesFieldBack = new Sprite();
	this._particlesFieldBack.z = 0;
    this.addChild(this._particlesFieldBack);
    this._particlesFieldFront = new Sprite();
	this._particlesFieldFront.z = 100;
    this.addChild(this._particlesFieldFront);
};

//==============================
// * Create Scene Particles
//==============================
Scene_Base.prototype.createSceneParticles = function() {
	this._sceneParticles = []
    var sceneParticles = this.getSceneParticles();
    for (var i = 0; i < Moghunter.tparticles_M; i++) {
       this._sceneParticles[i] = new SceneParticles(i, sceneParticles);
	   this._sceneParticles[i].z = 100 + i;
	   if (Math.random() < 0.5) {
	       this._particlesFieldBack.addChild(this._sceneParticles[i]);
	   } else {
	       this._particlesFieldFront.addChild(this._sceneParticles[i]);
	   }
    };
	this._particlesFieldBack.children.sort((a, b) => a.z - b.z);
	this._particlesFieldFront.children.sort((a, b) => a.z - b.z);
};

//=============================================================================
// ■ Scene Particles ■
//=============================================================================
function SceneParticles() {
    this.initialize.apply(this, arguments);
};

SceneParticles.prototype = Object.create(Sprite.prototype);
SceneParticles.prototype.constructor = SceneParticles;

//==============================
// * Initialize
//==============================
SceneParticles.prototype.initialize = function(index, sceneParticles) {
    Sprite.prototype.initialize.call(this);
	this._index = index;
    this._sceneParticles = sceneParticles;
	this._enabled = String(this._sceneParticles['P' + (this._index + 1) + '_Visible']) === "true" ? true : false;
	this._t = Number(this._sceneParticles['P' + (this._index + 1) + '_Transition_Time']);
    if (this._enabled) {
		this._img = ImageManager.loadTitle2(this._sceneParticles['P' + (this._index + 1) + '_File_Name'])
		this._start = false;
		this._img._cw = 0;
		this._img._ch = 0;
		this._img._cw2 = 0;
		this._img._ch2 = 0;
	};
};

//==============================
// * get Data
//==============================
SceneParticles.prototype.getData = function() {
	 this._img._cw = this._img.width;
	 this._img._cw2 = this._img._cw * 3;
	 this._img._ch = this._img.height;
	 this._img._ch2 = this._img._ch * 3;
	 this.createParticles();
};

//==============================
// * create Particles
//==============================
SceneParticles.prototype.createParticles = function() {
    this._spriteP = [];
	for (var i = 0;i < Number(this._sceneParticles['P' + (this._index + 1) + '_Amount']); i++){
		 this._spriteP[i] = new Sprite(this._img);
		 this._spriteP[i].sx = [0,Number(this._sceneParticles['P' + (this._index + 1) + '_X_Speed'])];
		 this._spriteP[i].sy = [0,Number(this._sceneParticles['P' + (this._index + 1) + '_Y_Speed'])];
		 this._spriteP[i].rt = [0,Number(this._sceneParticles['P' + (this._index + 1) + '_Rotation_Speed'])];
		 this._spriteP[i].blendMode = Number(this._sceneParticles['P' + (this._index + 1) + '_Blend_Mode']);
		 this._spriteP[i].anchor.x = Number(this._sceneParticles['P' + (this._index + 1) + '_Anchor']);
		 this._spriteP[i].anchor.y = Number(this._sceneParticles['P' + (this._index + 1) + '_Anchor']);
		 this._spriteP[i].int = true;
		 this._spriteP[i].lef = [String(this._sceneParticles['P' + (this._index + 1) + '_Leaf_Mode']) === "true" ? true : false,0,1.00,0];
		 this._spriteP[i].mode = Number(this._sceneParticles['P' + (this._index + 1) + '_Mode']);
		 this._spriteP[i].animation = {};
		 this._spriteP[i].filters = [new PIXI.filters.BlurFilter()];
		 this.addChild(this._spriteP[i]);
		 this.refreshParticles(this._spriteP[i]);
	};
	this._start = true;
};

//==============================
// * refresh Particles
//==============================
SceneParticles.prototype.refreshParticles = function(sprite) {
	 if (sprite.sx[1] != 0) {
	     var r = 0.7 + Math.abs(Math.random() * sprite.sx[1]);
		 sprite.sx[0] = sprite.sx[1] > 0 ? r : -r;
	 };
	 if (sprite.sy[1] != 0) {
	     var r = 0.7 + Math.abs(Math.random() * sprite.sy[1]);
		 sprite.sy[0] = sprite.sy[1] > 0 ? r : -r;
	 };
	 if (sprite.rt[1] != 0) {
	     var r = 0.03 + Math.abs(Math.random() * sprite.rt[1]);
		 sprite.rt[0] = sprite.rt[1] > 0 ? r : -r;
	 };
     var r = Math.randomInt(360) * 0.01;
     sprite.rotation = r;
	 var pz = ((Math.random() * 0.5) * 1);
	 sprite.scale = new PIXI.Point(0.5 + Number(pz), 0.5 + Number(pz));
	 sprite.lef[1] = 0;
	 sprite.lef[2] = sprite.scale.x;

	 sprite.lef[3] = 120 + Math.randomInt(180);
	 sprite.opacity = 255;
	 this.setPosition(sprite);
	 this.initAnimation(sprite);
};

//==============================
// * init Animation
//==============================
SceneParticles.prototype.initAnimation = function(sprite) {
    switch (sprite.mode) {
        case 1: // Pulse
            sprite.animation.speed = 0.01 + Math.random() * 0.01;
            sprite.animation.minScale = 0.5;
            sprite.animation.maxScale = 1.0;
            sprite.animation.direction = 1;
            break;
        case 2: // Flicker
            sprite.animation.speed = 1 + Math.randomInt(2);
            sprite.animation.duration = 0;
            break;
        case 3: // Wave
            sprite.animation.angle = Math.random() * Math.PI * 2;
            sprite.animation.speed = 0.02 + Math.random() * 0.02;
            sprite.animation.amplitude = 5 + Math.randomInt(5);
            break;
        case 4: // Spiral
            sprite.animation.angle = Math.random() * Math.PI * 2;
            sprite.animation.radius = 10 + Math.randomInt(10);
            sprite.animation.speed = 0.02 + Math.random() * 0.02;
            break;
        case 5: // Explode
            var angle = Math.random() * Math.PI * 2;
            var speed = 2 + Math.random() * 2;
            sprite.sx[0] = Math.cos(angle) * speed;
            sprite.sy[0] = Math.sin(angle) * speed;
            break;
        case 6: // Fall
            sprite.sy[0] += 0.05;
            break;
        case 7: // Rise
            sprite.sy[0] -= 0.05;
            break;
        case 8: // Orbit
            sprite.animation.angle = Math.random() * Math.PI * 2;
            sprite.animation.radius = 50 + Math.randomInt(50);
            sprite.animation.speed = 0.01 + Math.random() * 0.01;
            sprite.animation.cx = Graphics.width / 2;
            sprite.animation.cy = Graphics.height / 2;
            break;
        case 9: // Bounce
            sprite.animation.vx = sprite.sx[0];
            sprite.animation.vy = sprite.sy[0];
            break;
        case 10: // Zigzag
            sprite.animation.direction = Math.random() < 0.5 ? 1 : -1;
            sprite.animation.duration = 30 + Math.randomInt(30);
            break;
        case 11: // Random Walk
            sprite.animation.duration = 10 + Math.randomInt(10);
            break;
        case 12: // Rain
            sprite.sy[0] = 5 + Math.random() * 5;
            break;
        case 13: // Snow
            sprite.sy[0] = 1 + Math.random() * 1;
            sprite.sx[0] = Math.random() * 2 - 1;
            break;
        case 14: // Meteor
            sprite.sx[0] = -10;
            sprite.sy[0] = 10;
            sprite.rt[0] = 0.1;
            break;
        case 15: // Vortex
            sprite.animation.angle = Math.atan2(sprite.y - Graphics.height / 2, sprite.x - Graphics.width / 2);
            sprite.animation.speed = 2 + Math.random() * 2;
            sprite.animation.radius = Math.hypot(sprite.x - Graphics.width / 2, sprite.y - Graphics.height / 2);
            break;
        case 16: // Twirl
            sprite.animation.angle = 0;
            sprite.animation.speed = 0.05 + Math.random() * 0.05;
            break;
        case 17: // Gravity
            sprite.animation.vy = 0;
            break;
        case 18: // Anti-Gravity
            sprite.animation.vy = 0;
            break;
        case 19: // Shrink
            sprite.animation.speed = 0.01 + Math.random() * 0.01;
            break;
        case 20: // Grow
            sprite.animation.speed = 0.01 + Math.random() * 0.01;
            sprite.scale.x = 0;
            sprite.scale.y = 0;
            break;
    }
};

//==============================
// * set Position
//==============================
SceneParticles.prototype.setPosition = function(sprite) {
	if (sprite.int) {
        this.setStartPosition(sprite);
	} else {
        this.setPositionX(sprite);
        this.setPositionY(sprite);
	};
};

//==============================
// * set Start Position
//==============================
SceneParticles.prototype.setStartPosition = function(sprite) {
	var r = Math.randomInt(Graphics.width + this._img._cw2);
	sprite.x = -this._img._cw + r;
	var r = Math.randomInt(Graphics.height + this._img._ch2);
	sprite.y = -this._img._ch + r;
	sprite.int = false;
};

//==============================
// * set Position X
//==============================
SceneParticles.prototype.setPositionX = function(sprite) {
    if (sprite.sx[1] > 0) {
		var r = Math.randomInt(Graphics.width - this.lx1(sprite));
		sprite.x = this.lx1(sprite) + r;
	} else if (sprite.sx[1] < 0) {
		var r = Math.randomInt(Graphics.width - this.lx1(sprite));
		sprite.x = -this.lx1(sprite) + r;
	} else {
		var r = Math.randomInt(Graphics.width + this._img._cw * 2);
		sprite.x = -this._img._cw + r;
	};
};

//==============================
// * set Position Y
//==============================
SceneParticles.prototype.setPositionY = function(sprite) {
    if (sprite.sy[1] > 0) {
		 sprite.y = this.ly1();
	} else if (sprite.sy[1] < 0) {
		 sprite.y = this.ly2();
	} else {
		var r = Math.randomInt(Graphics.height + this._img._ch * 2);
		sprite.y = -this._img._ch + r;
	};
};

//==============================
// * lx1
//==============================
SceneParticles.prototype.lx1 = function(sprite) {
   if (sprite.sx[1] > 0) {return -Graphics.width / 2;
   } else {return -this._img._cw2};
};

//==============================
// * lx2
//==============================
SceneParticles.prototype.lx2 = function(sprite) {
    if (sprite.sx[1] > 0) {return Graphics.width + this._img._cw2;
	} else {return Graphics.width + Graphics.width / 2};
};

//==============================
// * ly1
//==============================
SceneParticles.prototype.ly1 = function(sprite) {
   return -this._img._ch2;
};

//==============================
// * ly2
//==============================
SceneParticles.prototype.ly2 = function(sprite) {
	return Graphics.height + this._img._ch2
};

//==============================
// * update Move
//==============================
SceneParticles.prototype.updateMove = function(sprite) {
     sprite.x += sprite.sx[0];
	 sprite.y += sprite.sy[0];
	 sprite.rotation += sprite.rt[0];
	 sprite.opacity += 15;
	 if (sprite.lef[0]) {this.updateLeaf(sprite)};
	 this.updateAnimation(sprite);
	 this.updateZPosition(sprite);
	 this.updateBlur(sprite);
};

//==============================
// * update Blur
//==============================
SceneParticles.prototype.updateBlur = function(sprite) {
    var blur = (1 - sprite.scale.x) * 10;
    sprite.filters[0].blur = blur;
};

//==============================
// * update Z Position
//==============================
SceneParticles.prototype.updateZPosition = function(sprite) {
    if (sprite.scale.x < 0.7 && sprite.parent === this.parent._particlesFieldFront) {
        this.parent._particlesFieldFront.removeChild(sprite);
        this.parent._particlesFieldBack.addChild(sprite);
    } else if (sprite.scale.x >= 0.7 && sprite.parent === this.parent._particlesFieldBack) {
        this.parent._particlesFieldBack.removeChild(sprite);
        this.parent._particlesFieldFront.addChild(sprite);
    }
};

//==============================
// * update Animation
//==============================
SceneParticles.prototype.updateAnimation = function(sprite) {
    switch (sprite.mode) {
        case 1: // Pulse
            if (sprite.animation.direction === 1) {
                sprite.scale.x += sprite.animation.speed;
                sprite.scale.y += sprite.animation.speed;
                if (sprite.scale.x >= sprite.animation.maxScale) {
                    sprite.animation.direction = -1;
                }
            } else {
                sprite.scale.x -= sprite.animation.speed;
                sprite.scale.y -= sprite.animation.speed;
                if (sprite.scale.x <= sprite.animation.minScale) {
                    sprite.animation.direction = 1;
                }
            }
            break;
        case 2: // Flicker
            sprite.animation.duration++;
            if (sprite.animation.duration >= sprite.animation.speed) {
                sprite.opacity = Math.random() * 255;
                sprite.animation.duration = 0;
            }
            break;
        case 3: // Wave
            sprite.animation.angle += sprite.animation.speed;
            sprite.x += Math.cos(sprite.animation.angle) * sprite.animation.amplitude;
            sprite.y += Math.sin(sprite.animation.angle) * sprite.animation.amplitude;
            break;
        case 4: // Spiral
            sprite.animation.angle += sprite.animation.speed;
            sprite.animation.radius += 0.5;
            sprite.x += Math.cos(sprite.animation.angle) * sprite.animation.radius;
            sprite.y += Math.sin(sprite.animation.angle) * sprite.animation.radius;
            break;
        case 5: // Explode
            sprite.opacity -= 2;
            break;
        case 8: // Orbit
            sprite.animation.angle += sprite.animation.speed;
            sprite.x = sprite.animation.cx + Math.cos(sprite.animation.angle) * sprite.animation.radius;
            sprite.y = sprite.animation.cy + Math.sin(sprite.animation.angle) * sprite.animation.radius;
            break;
        case 9: // Bounce
            if (sprite.x < 0 || sprite.x > Graphics.width) {
                sprite.animation.vx *= -1;
            }
            if (sprite.y < 0 || sprite.y > Graphics.height) {
                sprite.animation.vy *= -1;
            }
            sprite.x += sprite.animation.vx;
            sprite.y += sprite.animation.vy;
            break;
        case 10: // Zigzag
            sprite.animation.duration--;
            if (sprite.animation.duration <= 0) {
                sprite.animation.direction *= -1;
                sprite.animation.duration = 30 + Math.randomInt(30);
            }
            sprite.x += sprite.sx[0] * sprite.animation.direction;
            break;
        case 11: // Random Walk
            sprite.animation.duration--;
            if (sprite.animation.duration <= 0) {
                sprite.sx[0] = Math.random() * 4 - 2;
                sprite.sy[0] = Math.random() * 4 - 2;
                sprite.animation.duration = 10 + Math.randomInt(10);
            }
            break;
        case 15: // Vortex
            sprite.animation.radius -= sprite.animation.speed;
            sprite.animation.angle += 0.1;
            sprite.x = Graphics.width / 2 + Math.cos(sprite.animation.angle) * sprite.animation.radius;
            sprite.y = Graphics.height / 2 + Math.sin(sprite.animation.angle) * sprite.animation.radius;
            if (sprite.animation.radius <= 0) {
                this.refreshParticles(sprite);
            }
            break;
        case 16: // Twirl
            sprite.animation.angle += sprite.animation.speed;
            sprite.rotation = sprite.animation.angle;
            break;
        case 17: // Gravity
            sprite.animation.vy += 0.1;
            sprite.y += sprite.animation.vy;
            break;
        case 18: // Anti-Gravity
            sprite.animation.vy -= 0.1;
            sprite.y += sprite.animation.vy;
            break;
        case 19: // Shrink
            sprite.scale.x -= sprite.animation.speed;
            sprite.scale.y -= sprite.animation.speed;
            if (sprite.scale.x <= 0) {
                this.refreshParticles(sprite);
            }
            break;
        case 20: // Grow
            sprite.scale.x += sprite.animation.speed;
            sprite.scale.y += sprite.animation.speed;
            if (sprite.scale.x >= 1) {
                sprite.scale.x = 1;
                sprite.scale.y = 1;
            }
            break;
    }
};

//==============================
// * update Leaf
//==============================
SceneParticles.prototype.updateLeaf = function(sprite) {
	sprite.lef[3]--;
	if (sprite.lef[3] > 0) {return};
	sprite.scale.x -= 0.01;
	if (sprite.scale.x < -sprite.lef[2]) {
		 sprite.lef[1] = 1;
		 sprite.scale.x = -sprite.lef[2];
	};
};

//==============================
// * Need Refresh
//==============================
SceneParticles.prototype.needRefresh = function(sprite) {
     if (sprite.x < this.lx1(sprite)) {return true};
	 if (sprite.x > this.lx2(sprite)) {return true};
	 if (sprite.y < this.ly1(sprite)) {return true};
	 if (sprite.y > this.ly2(sprite)) {return true};
	 return false
};

//==============================
// * update Particles
//==============================
SceneParticles.prototype.updateParticles = function() {
	 if (this._img.isReady() && !this._start) {this.getData()};
	 if (!this._start) {return};
	 if (!this._spriteP) {return};
	 for (var i = 0; i < this._spriteP.length; i++) {
		  this.updateMove(this._spriteP[i]);
		  if (this.needRefresh(this._spriteP[i])) {this.refreshParticles(this._spriteP[i])};
	 };
};

//==============================
// * Update
//==============================
SceneParticles.prototype.update = function() {
	Sprite.prototype.update.call(this);
	if (this._enabled) {this.updateParticles()};
};
