import type { Lesson, LessonContent, Stage } from './types';

const authored: Record<number, LessonContent> = {
  1: {
    lead: 'Build a tiny, reproducible Phaser project and learn what each tool contributes. The aim is not merely to make a canvas appear: it is to establish a project you can explain, rebuild and commit with confidence.',
    outcomes: [
      'Explain the roles of Node.js, npm, Vite, TypeScript and Phaser',
      'Create a strict TypeScript project and launch it locally',
      'Read the browser console and recognise a successful Phaser boot',
      'Make a clean first Git commit with a useful README'
    ],
    concept: [
      'A browser game has two lives. During development, Vite serves source files quickly and reports mistakes. For release, it bundles your code and Phaser into static files a browser can load efficiently.',
      'Phaser owns the game loop and rendering canvas. Your scene supplies lifecycle methods such as create and update. TypeScript checks your assumptions before the browser runs them; strict mode is a design aid, not decoration.',
      'Pinning dependency versions makes the course reproducible. Upgrade deliberately, after reading release notes and running the project checks.'
    ],
    code: {
      filename: 'src/main.ts',
      language: 'ts',
      source: `import * as Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  create(): void {
    this.add.text(24, 24, 'Workshop online', {
      color: '#e4ff70',
      fontFamily: 'monospace',
      fontSize: '22px'
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  backgroundColor: '#111714',
  pixelArt: true,
  scene: BootScene
});`
    },
    demo: {
      kind: 'boot',
      title: 'Boot telemetry',
      description: 'This is a real Phaser instance bundled with the course. Restart it and watch the lifecycle counter prove that a new game has booted.'
    },
    exercises: [
      { id: 'l1-guided', kind: 'guided', title: 'Create the workshop', description: 'Create a Phaser 4 + TypeScript project, enable strict mode and reproduce the boot scene without copying the whole file at once.' },
      { id: 'l1-challenge', kind: 'challenge', title: 'Make it yours', description: 'Change the canvas size, background and message. Add a second line showing the renderer width and height from the scene scale manager.' },
      { id: 'l1-integration', kind: 'integration', title: 'Record the starting line', description: 'Add a README with setup commands, confirm a production build succeeds, then make a first Git commit.' }
    ],
    review: [
      'Can you explain why opening index.html directly is different from using Vite?',
      'Does a fresh clone work using only the commands in your README?',
      'Can you locate TypeScript errors, runtime errors and Phaser boot messages?'
    ],
    resources: [
      { label: 'Phaser installation guide', url: 'https://docs.phaser.io/phaser/getting-started/installation', note: 'Official installation options and project generator.' },
      { label: 'Phaser release archive', url: 'https://phaser.io/download/archive', note: 'Verify the version used by the course before upgrading.' }
    ]
  },
  2: {
    lead: 'Scenes are the rooms of a Phaser game: menus, battles, maps and results screens. Learn their lifecycle before those rooms begin exchanging player data and assets.',
    outcomes: [
      'Describe what preload, create and update are responsible for',
      'Configure more than one scene and transition between them',
      'Distinguish pausing, sleeping, stopping and restarting',
      'Keep scene setup explicit and easy to inspect'
    ],
    concept: [
      'A scene is both a lifecycle and a boundary. preload acquires assets, create builds the current state, and update responds to time. Not every scene needs every method.',
      'Stopping destroys a scene run; sleeping preserves its display objects and state; pausing stops updates while keeping it visible. Choosing deliberately prevents menus, timers and input handlers from quietly continuing in the background.',
      'Scene transitions are commands. Treat their payloads like small typed messages rather than reaching into another scene and changing its internals.'
    ],
    code: {
      filename: 'src/scenes/TitleScene.ts',
      language: 'ts',
      source: `type RunData = { difficulty: 'standard' | 'veteran' };

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const start = this.add.text(320, 220, 'Begin patrol')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    start.on('pointerup', () => {
      const data: RunData = { difficulty: 'standard' };
      this.scene.start('arena', data);
    });
  }
}`
    },
    demo: {
      kind: 'scenes',
      title: 'Scene control desk',
      description: 'Use the controls to start, pause, resume and restart a scene. The log shows which lifecycle work continues.'
    },
    exercises: [
      { id: 'l2-guided', kind: 'guided', title: 'Add a title scene', description: 'Create title and arena scenes, register both in the game configuration and transition using an interactive text object.' },
      { id: 'l2-challenge', kind: 'challenge', title: 'Pause with intent', description: 'Add a pause overlay that freezes the arena but remains interactive. Explain why you chose pause rather than sleep.' },
      { id: 'l2-integration', kind: 'integration', title: 'Document the flow', description: 'Draw a small scene-flow diagram in the README and commit the working transition.' }
    ],
    review: [
      'Does restarting create duplicate input listeners?',
      'Is data passed through a typed boundary?',
      'Can you predict which lifecycle methods run for each scene command?'
    ]
  },
  3: {
    lead: 'Every future system—movement, attacks, tilemaps, line of sight—depends on spatial reasoning. Make coordinates visible and manipulable before hiding them behind sprites.',
    outcomes: [
      'Use the Phaser screen coordinate system confidently',
      'Explain origin, position, width and display size',
      'Convert a pointer position into useful game information',
      'Render crisp pixel-art shapes on integer coordinates'
    ],
    concept: [
      'In Phaser, x grows to the right and y grows downward. A game object is positioned by its origin, which defaults to its centre. That single fact explains many apparent alignment bugs.',
      'Logical coordinates describe the game world; the canvas may be displayed at a different CSS size. Phaser’s input system performs the conversion, so prefer pointer coordinates supplied by the scene over raw browser page coordinates.',
      'Pixel art rewards consistency: integer positions, whole-number scaling, nearest-neighbour sampling and one chosen base tile size.'
    ],
    code: {
      filename: 'src/scenes/CoordinateScene.ts',
      language: 'ts',
      source: `create(): void {
  const marker = this.add.rectangle(160, 90, 16, 16, 0xe4ff70);
  const readout = this.add.text(12, 12, '', { color: '#ffffff' });

  this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    const x = Math.round(pointer.x);
    const y = Math.round(pointer.y);
    marker.setPosition(x, y);
    readout.setText(\`x: \${x}  y: \${y}\`);
  });
}`
    },
    demo: {
      kind: 'coordinates',
      title: 'Coordinate field',
      description: 'Move across the grid to inspect coordinates. Click to place a beacon and see its distance from the origin.'
    },
    exercises: [
      { id: 'l3-guided', kind: 'guided', title: 'Build a coordinate inspector', description: 'Draw a 32-pixel grid, follow the pointer with a marker and print its rounded x/y position.' },
      { id: 'l3-challenge', kind: 'challenge', title: 'Snap to the grid', description: 'Add a second marker that snaps to the centre of the nearest grid cell. Derive the formula before coding it.' },
      { id: 'l3-integration', kind: 'integration', title: 'Create the arena bounds', description: 'Define the training arena as a rectangle and add a debug toggle that shows its bounds and centre.' }
    ],
    review: [
      'What changes when an object origin is set to 0,0?',
      'Can you convert a world coordinate to a grid cell and back?',
      'Do objects remain crisp when the browser window changes size?'
    ]
  },
  4: {
    lead: 'Input begins as physical device state—keys held, buttons pressed and pointer positions—but gameplay needs intent: move north-west, interact once, pause now. This lesson builds a small boundary between those worlds so movement remains testable, controls can change and one device does not become part of the game rules.',
    outcomes: [
      'Choose polling or an edge-triggered action deliberately',
      'Read cursor keys and WASD through one typed input adapter',
      'Represent movement intent as a normalised direction',
      'Explain why diagonal input must be normalised',
      'Convert a pointer position into world-space direction',
      'Define how simultaneous devices and opposite keys should behave'
    ],
    concept: [
      'Phaser’s global Input Manager receives browser events and each scene has an Input Plugin that exposes them in game-friendly form. Key objects remember whether a key is currently down; pointers expose button state and positions. Your scene should use those facilities rather than registering unrelated browser listeners for ordinary controls.',
      'Continuous actions and discrete actions ask different questions. Movement asks “is this direction held during this update?” Pause asks “did this key become pressed since I last checked?” Treating pause like movement may open and close a menu repeatedly; treating movement as a single event makes an actor move only when key-repeat events arrive.',
      'The adapter’s output is a contract expressed in game language. Movement code consumes { x, y }; scene flow consumes pausePressed. Neither needs to know whether the player used arrows, WASD, a pointer or eventually a gamepad.'
    ],
    conceptSections: [
      {
        title: 'Held state and press edges solve different problems',
        paragraphs: [
          'Key.isDown remains true for every update while the key is held, which makes it suitable for movement. Phaser.Input.Keyboard.JustDown(key) returns true once when the key crosses from up to down, which makes it suitable for pause, confirm or interaction.',
          'A native keydown event may repeat according to operating-system settings. Basing gameplay repetition on update and elapsed time is more predictable than relying on browser key repeat.'
        ],
        code: {
          filename: 'continuous-and-discrete-input.ts',
          language: 'ts',
          source: `// Continuous: true throughout the hold
const movingLeft = cursors.left.isDown;

// Discrete: true for one game step per press
const pausePressed = Phaser.Input.Keyboard.JustDown(pauseKey);

if (pausePressed) {
  this.scene.pause();
  this.scene.launch('pause', { returnTo: this.scene.key });
}`
        },
        takeaway: 'Poll a state for continuous intent; detect an edge for a one-shot command.'
      },
      {
        title: 'Translate devices at the boundary',
        paragraphs: [
          'The input adapter owns Phaser key objects and returns a plain typed value. It combines arrow keys and WASD because both mean the same thing to gameplay. The scene asks for intent once per update and passes that intent to movement.',
          'The adapter should not move the player. Its job ends after translation; this is what later allows AI or replay data to supply the same intent shape.'
        ],
        code: {
          filename: 'src/input/KeyboardInput.ts',
          language: 'ts',
          source: `export type PlayerIntent = Readonly<{
  moveX: number;
  moveY: number;
  pausePressed: boolean;
}>;

type MovementKeys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

export class KeyboardInput {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: MovementKeys;
  private readonly pauseKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error('Keyboard input is disabled for this game');
    }

    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys('W,A,S,D') as MovementKeys;
    this.pauseKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  read(): PlayerIntent {
    const rawX = Number(this.cursors.right.isDown || this.wasd.D.isDown)
      - Number(this.cursors.left.isDown || this.wasd.A.isDown);
    const rawY = Number(this.cursors.down.isDown || this.wasd.S.isDown)
      - Number(this.cursors.up.isDown || this.wasd.W.isDown);
    const length = Math.hypot(rawX, rawY);

    return {
      moveX: length > 0 ? rawX / length : 0,
      moveY: length > 0 ? rawY / length : 0,
      pausePressed: Phaser.Input.Keyboard.JustDown(this.pauseKey)
    };
  }
}`
        },
        takeaway: 'Gameplay should depend on PlayerIntent, not Phaser key objects.'
      },
      {
        title: 'Normalisation preserves one maximum speed',
        paragraphs: [
          'Pressing right produces (1, 0), whose length is 1. Pressing right and down produces (1, 1), whose length is √2—about 1.414. If movement multiplies that vector by speed, diagonal travel becomes roughly 41% faster.',
          'Dividing each component by the vector length preserves its direction while reducing its length to one. Never divide the zero vector: check its length first.'
        ],
        code: {
          filename: 'normalising-direction.ts',
          language: 'ts',
          source: `const rawX = 1;
const rawY = 1;
const length = Math.hypot(rawX, rawY); // √2

const moveX = rawX / length; // approximately 0.707
const moveY = rawY / length; // approximately 0.707

console.log(Math.hypot(moveX, moveY)); // 1`
        },
        takeaway: 'Direction has a maximum length of one; speed is applied separately in Lesson 5.'
      },
      {
        title: 'Pointer steering uses world space and a dead zone',
        paragraphs: [
          'pointer.x and pointer.y are positions on the game canvas. pointer.worldX and pointer.worldY are translated through a camera. They happen to match before the camera moves, but only world coordinates describe the same space as a world actor.',
          'Subtract actor position from pointer position to obtain a direction toward the pointer. Normalise it exactly like keyboard input. Add a small dead zone so the actor stops near the target instead of oscillating around one pixel.'
        ],
        code: {
          filename: 'pointer-direction-ingredients.ts',
          language: 'ts',
          source: `const pointer = this.input.activePointer;
pointer.updateWorldPoint(this.cameras.main);

const offsetX = pointer.worldX - player.x;
const offsetY = pointer.worldY - player.y;
const distance = Math.hypot(offsetX, offsetY);
const DEAD_ZONE = 8;

// Your challenge: when pointer.isDown and distance > DEAD_ZONE,
// translate this offset into the same { moveX, moveY } contract.`
        },
        takeaway: 'Convert every device into the same intent coordinate system before movement sees it.'
      },
      {
        title: 'Conflicts, focus and lifecycle require policy',
        paragraphs: [
          'If left and right are held together, subtraction naturally produces zero. If keyboard and pointer both request movement, there is no universally correct answer: keyboard may win, the most recently used device may win, or both directions may be combined and normalised. Choose and document one policy rather than accepting accidental behaviour.',
          'Keyboard input normally listens at the window level, while pointer input begins over the canvas. When several scenes run in parallel, decide which scene owns input; menus should not allow hidden gameplay to respond. Phaser-owned keys follow the scene input lifecycle, but listeners attached to window, game.events or a custom global emitter require explicit cleanup during shutdown.'
        ],
        code: {
          filename: 'input-conflict-policy.ts',
          language: 'ts',
          source: `function chooseMovement(
  keyboard: Phaser.Math.Vector2,
  pointer: Phaser.Math.Vector2
): Phaser.Math.Vector2 {
  // Policy: an active keyboard direction takes priority.
  return keyboard.lengthSq() > 0 ? keyboard : pointer;
}

// Other valid policies exist. The important part is making one explicit.`
        }
      }
    ],
    code: {
      filename: 'src/scenes/TrainingArena.ts',
      language: 'ts',
      source: `export class TrainingArena extends Phaser.Scene {
  private inputAdapter!: KeyboardInput;
  private player!: Phaser.GameObjects.Rectangle;

  create(): void {
    this.inputAdapter = new KeyboardInput(this);
    this.player = this.add.rectangle(320, 180, 24, 24, 0xe4ff70);
  }

  update(): void {
    const intent = this.inputAdapter.read();

    // Temporary per-frame movement makes the input visible.
    // Lesson 5 replaces this with speed × delta time.
    this.player.x += intent.moveX * 2;
    this.player.y += intent.moveY * 2;

    if (intent.pausePressed) {
      this.scene.pause();
      this.scene.launch('pause', { returnTo: this.scene.key });
    }
  }
}`
    },
    demo: {
      kind: 'input',
      title: 'Intent monitor',
      description: 'Switch among keyboard, pointer and hybrid policies. Hold the pointer or use WASD/arrows; the readout shows the normalised intent that movement receives rather than the raw device state.'
    },
    exercises: [
      { id: 'l4-guided', kind: 'guided', title: 'Build the keyboard adapter', description: 'Create a typed input adapter supporting arrows and WASD. Return normalised moveX/moveY and an edge-triggered pausePressed value. Move the arena rectangle from the returned intent, then prove opposite keys cancel and diagonal length is one.' },
      { id: 'l4-challenge', kind: 'challenge', title: 'Add pointer steering', description: 'When the pointer is held, produce movement intent from the actor toward the pointer using world coordinates and an 8-pixel dead zone. Do not change the movement code; choose and document what happens when keyboard and pointer are active together.' },
      { id: 'l4-integration', kind: 'integration', title: 'Test the control contract', description: 'Add a temporary debug readout for source, vector components and length. Test arrows, WASD, opposites, diagonals, pointer dead zone, loss of focus and repeated pause presses; record the control and conflict policy in README before committing.' }
    ],
    review: [
      'Which actions use held state, and which require a single press edge?',
      'Is every non-zero movement intent length equal to one before speed is applied?',
      'Can movement be tested by supplying a PlayerIntent without creating keyboard events?',
      'What happens when opposite directions are held together?',
      'Are pointer coordinates in the same world space as the actor after a camera moves?',
      'Which device wins when keyboard and pointer conflict, and is that policy visible in the code?',
      'Can pause be pressed repeatedly without launching duplicate pause scenes?',
      'Are any listeners attached to objects that outlive the scene and therefore require cleanup?'
    ],
    resources: [
      { label: 'Phaser input concepts', url: 'https://docs.phaser.io/phaser/concepts/input', note: 'Official guide to keyboard, pointer and interactive-object input.' },
      { label: 'Phaser Keyboard Plugin', url: 'https://docs.phaser.io/api-documentation/4.0.0/class/input-keyboard-keyboardplugin', note: 'Key creation, cursor keys, capture and scene-owned keyboard input.' },
      { label: 'Phaser Pointer', url: 'https://docs.phaser.io/api-documentation/4.0.0/class/input-pointer', note: 'Pointer button state, canvas positions and camera-translated world coordinates.' }
    ]
  },
  5: {
    lead: 'A game does not move continuously. Phaser repeatedly asks your running scene to advance by a small amount, renders the result, and does it again. This lesson turns that heartbeat into predictable movement that behaves consistently on different displays and after brief slowdowns.',
    outcomes: [
      'Explain what the game loop does during each frame',
      'Distinguish elapsed time, frame count and movement speed',
      'Use delta time to express movement in pixels per second',
      'Keep diagonal movement normalised and constrain an actor to the arena',
      'Recognise when a large time step needs special handling'
    ],
    concept: [
      'Phaser calls a running scene’s update(time, delta) method once for each game step. time is the current high-resolution clock value; delta is the elapsed time since the previous step, expressed in milliseconds. The browser normally drives this loop with requestAnimationFrame, so the number of updates depends on the display, browser workload and whether the tab is visible.',
      'Movement written as “add four pixels every update” measures speed in pixels per frame. A 120 Hz display then moves the actor roughly twice as far per second as a 60 Hz display. Movement written as “160 pixels per second multiplied by elapsed seconds” measures an actual rate and is independent of how many frames produced that second.',
      'Delta time solves variable frame rates, but it does not turn one giant update into many small physical steps. Phaser smooths and caps its loop delta, and your own rules may still need an application-specific maximum or a fixed-step simulation later. For this training arena, variable-step movement with a modest clamp is the appropriate level of complexity.'
    ],
    conceptSections: [
      {
        title: 'One frame is a sample, not a unit of speed',
        paragraphs: [
          'The first example below looks reasonable on the developer’s machine, but its true speed is 4 × current frame rate. At 30 updates per second it travels about 120 pixels; at 120 updates it travels about 480 pixels.',
          'The corrected version converts milliseconds to seconds and multiplies by a rate named in pixels per second. Naming the unit in a constant makes the maths reviewable.'
        ],
        code: {
          filename: 'frame-rate-comparison.ts',
          language: 'ts',
          source: `// Incorrect: pixels per frame
player.x += 4;

// Correct: pixels per second
const SPEED_PIXELS_PER_SECOND = 160;
const elapsedSeconds = delta / 1000;

player.x += SPEED_PIXELS_PER_SECOND * elapsedSeconds;`
        },
        takeaway: 'If a value is multiplied once per update, ask what unit it is measured in.'
      },
      {
        title: 'Direction and speed are separate decisions',
        paragraphs: [
          'Lesson 4 produced a normalised intent vector. This lesson consumes that direction together with a speed and elapsed time. Keeping these ideas separate means sprinting can change speed without changing input, and AI can later provide direction without knowing how rendering works.',
          'Use Vector2 only as a convenient representation; the important part is that its length is at most one before speed is applied.'
        ],
        code: {
          filename: 'src/movement/moveActor.ts',
          language: 'ts',
          source: `function moveActor(
  actor: Phaser.GameObjects.Rectangle,
  direction: Phaser.Math.Vector2,
  speed: number,
  deltaMs: number
): void {
  const elapsedSeconds = deltaMs / 1000;

  actor.x += direction.x * speed * elapsedSeconds;
  actor.y += direction.y * speed * elapsedSeconds;
}`
        }
      },
      {
        title: 'Slow frames and defensive limits',
        paragraphs: [
          'If an update receives an unusually large delta, directly applying it can make an actor jump through a boundary or collision. A local clamp limits how much movement one update may contribute. It deliberately discards some elapsed time in exchange for a stable recovery.',
          'Do not blindly clamp every timer in the game. A countdown or cooldown may need to reflect real elapsed time even when movement is limited. Apply the policy at the system that owns the consequence.'
        ],
        code: {
          filename: 'movement-delta-policy.ts',
          language: 'ts',
          source: `const MAX_MOVEMENT_DELTA_MS = 50;
const movementDelta = Math.min(delta, MAX_MOVEMENT_DELTA_MS);

moveActor(player, direction, 160, movementDelta);`
        },
        takeaway: 'Clamping is a game-design policy, not a universal correction to time.'
      }
    ],
    code: {
      filename: 'src/scenes/TrainingArena.ts',
      language: 'ts',
      source: `export class TrainingArena extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  create(): void {
    this.player = this.add.rectangle(320, 180, 24, 24, 0xe4ff70);
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    const direction = new Phaser.Math.Vector2(
      Number(this.cursors.right.isDown) - Number(this.cursors.left.isDown),
      Number(this.cursors.down.isDown) - Number(this.cursors.up.isDown)
    );

    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const elapsedSeconds = Math.min(delta, 50) / 1000;
    const speed = 160;

    this.player.x += direction.x * speed * elapsedSeconds;
    this.player.y += direction.y * speed * elapsedSeconds;

    this.player.x = Phaser.Math.Clamp(this.player.x, 12, 628);
    this.player.y = Phaser.Math.Clamp(this.player.y, 12, 348);
  }
}`
    },
    demo: {
      kind: 'delta-time',
      title: 'Frames versus elapsed time',
      description: 'Change the simulated update rate. The orange actor moves a fixed distance per frame; the green actor uses pixels per second and therefore keeps the same real speed.'
    },
    exercises: [
      { id: 'l5-guided', kind: 'guided', title: 'Move at a measurable speed', description: 'Move the training actor at 160 pixels per second using the intent from Lesson 4. Normalise diagonal input, constrain the actor using half its displayed size, and add a readout showing delta and calculated displacement.' },
      { id: 'l5-challenge', kind: 'challenge', title: 'Design a temporary sprint', description: 'Add a sprint that lasts 0.75 seconds and then enters a 2-second cooldown. Decide whether these timers should use raw or movement-clamped delta, document the decision, and prevent repeated key presses from restarting an active sprint.' },
      { id: 'l5-integration', kind: 'integration', title: 'Prove frame-rate independence', description: 'Use browser throttling or Phaser’s FPS limit to compare movement at two update rates. Record the expected and observed distance travelled over two seconds, then commit the arena movement.' }
    ],
    review: [
      'Why does multiplying by delta / 1000 produce pixels rather than pixels per second?',
      'At 160 pixels per second, how far should the actor move during a 25 ms update?',
      'Does diagonal movement cover the same distance as horizontal movement over one second?',
      'Which systems should continue using real elapsed time if movement delta is clamped?',
      'What happens to movement when the scene is paused and later resumed?'
    ],
    resources: [
      { label: 'Phaser Scene update', url: 'https://docs.phaser.io/api-documentation/4.0.0/class/scene', note: 'Official update(time, delta) contract and units.' },
      { label: 'Phaser game loop', url: 'https://docs.phaser.io/api-documentation/4.0.0/class/core-timestep', note: 'How Phaser schedules and measures game steps.' }
    ]
  },
  6: {
    lead: 'Shapes are excellent while rules are changing; sprites communicate identity. This lesson introduces the asset pipeline without allowing filenames, licences or texture settings to become invisible project debt.',
    outcomes: [
      'Distinguish an image file, Phaser texture, texture frame and sprite',
      'Load an asset in preload and use its texture key in create',
      'Preserve crisp pixel art through nearest-neighbour filtering and integer scaling',
      'Choose a consistent base tile and sprite size',
      'Record asset provenance and licence terms before committing files'
    ],
    concept: [
      'An image file is a project asset on disk. Loading it creates a Texture managed by Phaser under a unique key. A Texture may contain one Frame or many; a Sprite is a scene object that displays one of those frames. Keeping those terms distinct makes animation and atlases much easier to reason about.',
      'preload describes files the scene needs. Phaser loads them before create runs, so create can safely ask the Texture Manager for their keys. A missing or misspelled key usually produces the built-in missing texture rather than your artwork.',
      'Pixel art is designed around discrete source pixels. Integer scale factors and nearest-neighbour filtering preserve their edges. Fractional scaling or linear filtering blends neighbouring colours and makes small sprites look soft.'
    ],
    conceptSections: [
      {
        title: 'File path, texture key and sprite are different things',
        paragraphs: [
          'The texture key is an internal identifier chosen by you; it does not need to match the filename. All later code should use the key, which lets you reorganise asset files without changing gameplay code.',
          'Files placed in Vite’s public directory are served from the site root. A file stored at public/assets/player.png is therefore requested as /assets/player.png.'
        ],
        code: {
          filename: 'src/scenes/TrainingArena.ts',
          language: 'ts',
          source: `preload(): void {
  this.load.image('trainee', '/assets/player.png');
}

create(): void {
  const player = this.add.sprite(320, 180, 'trainee');
  player.setScale(4);
}`
        },
        takeaway: 'Use stable semantic keys such as trainee or stone-floor, not paths as keys.'
      },
      {
        title: 'Spritesheets divide one texture into frames',
        paragraphs: [
          'A spritesheet is a regular grid of equally sized frames. Phaser must know the source frame dimensions; the displayed scale is a separate concern. A sheet containing four 16×16 frames in one row is 64×16 pixels, but frameWidth remains 16.',
          'If frames have irregular sizes or need names, a texture atlas is a better later choice. The foundations project only needs a regular sheet.'
        ],
        code: {
          filename: 'spritesheet-loading.ts',
          language: 'ts',
          source: `preload(): void {
  this.load.spritesheet('trainee-walk', '/assets/trainee-walk.png', {
    frameWidth: 16,
    frameHeight: 16
  });
}

create(): void {
  this.add.sprite(320, 180, 'trainee-walk', 0).setScale(4);
}`
        }
      },
      {
        title: 'Pixel-perfect presentation is a chain of decisions',
        paragraphs: [
          'The game-level pixelArt option selects nearest-neighbour sampling for textures. You can also set the filter mode of an individual texture. Keep the camera and important objects on integer positions when possible, and prefer whole-number scales such as 2, 3 or 4.',
          'A 16-pixel source sprite displayed at scale 4 becomes 64 screen pixels. Its gameplay footprint does not automatically need to equal that entire visual square; collision bodies are introduced later.'
        ],
        code: {
          filename: 'pixel-art-configuration.ts',
          language: 'ts',
          source: `const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  pixelArt: true,
  roundPixels: true,
  scene: [TrainingArena]
};

// Optional per-texture override:
this.textures
  .get('trainee')
  .setFilter(Phaser.Textures.FilterMode.NEAREST);`
        }
      },
      {
        title: 'An asset is not finished until its licence is recorded',
        paragraphs: [
          '“Free to download” does not necessarily permit redistribution or commercial use. Record the creator, source URL, exact licence, local files and modifications when the asset enters the repository—not months later when the page has disappeared.',
          'For this lesson, either draw a tiny original 16×16 trainee or use an explicitly CC0 asset. Do not spend the exercise hunting for perfect final art.'
        ],
        code: {
          filename: 'ASSETS.md',
          language: 'md',
          source: `## Trainee sprite

- Files: public/assets/player.png
- Creator: Your Name
- Source: Original work
- Licence: CC0-1.0
- Modified: Created at 16 × 16 pixels for the training arena
- Added: 2026-11-17`
        },
        takeaway: 'Provenance is part of the asset, not optional project administration.'
      }
    ],
    code: {
      filename: 'src/scenes/TrainingArena.ts',
      language: 'ts',
      source: `export class TrainingArena extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;

  preload(): void {
    this.load.image('trainee', '/assets/player.png');
  }

  create(): void {
    if (!this.textures.exists('trainee')) {
      throw new Error('Expected the trainee texture to be loaded');
    }

    this.textures
      .get('trainee')
      .setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.player = this.add
      .sprite(320, 180, 'trainee')
      .setScale(4);
  }
}`
    },
    demo: {
      kind: 'sprites',
      title: 'Pixel sampling laboratory',
      description: 'Change the sprite scale and switch between nearest and linear filtering. The source artwork is deliberately tiny so every source pixel remains visible.'
    },
    exercises: [
      { id: 'l6-guided', kind: 'guided', title: 'Replace the training shape', description: 'Create or obtain an explicitly CC0 16×16 or 32×32 character image, place it under public/assets, load it in preload, and replace the arena rectangle with a Sprite without changing the movement rules.' },
      { id: 'l6-challenge', kind: 'challenge', title: 'Build an asset inspection scene', description: 'Create a scene that displays the sprite at scales 1, 2, 3 and 4 beside labels. Add a key that toggles the texture between NEAREST and LINEAR filtering and describe the visual difference.' },
      { id: 'l6-integration', kind: 'integration', title: 'Create the asset ledger', description: 'Add ASSETS.md with source, creator, licence, affected files and modifications. Confirm the game still works with the network disconnected, then commit the sprite and ledger together.' }
    ],
    review: [
      'What is the difference between a source image, a texture, a frame and a sprite?',
      'Why does Phaser use a texture key instead of repeatedly referring to a filename?',
      'What happens when a 16×16 sprite is rendered at scale 3?',
      'Why can two sprites using the same texture not use different texture filtering modes?',
      'Can every asset in the repository be traced to a licence that permits its intended use?'
    ],
    resources: [
      { label: 'Phaser textures', url: 'https://docs.phaser.io/phaser/concepts/textures', note: 'Textures, frames, spritesheets and filtering.' },
      { label: 'Kenney licence guidance', url: 'https://kenney.nl/support', note: 'Kenney’s official explanation of its CC0 asset terms.' }
    ]
  },
  7: {
    lead: 'Animation is not merely cycling pictures. It is visible evidence of game state. This lesson connects movement intent to sprite animation and adds short-lived effects that make actions readable without letting presentation decide the rules.',
    outcomes: [
      'Create a reusable animation from spritesheet frames',
      'Select animation from explicit actor state',
      'Avoid recreating global animation definitions on scene restart',
      'Distinguish frame animation, tweening and game-state change',
      'Use brief effects to communicate an event without changing its outcome'
    ],
    concept: [
      'A spritesheet texture contains frames; an animation defines an ordered timeline through some of those frames; each Sprite owns playback state such as its current frame and progress. Several sprites can therefore play the same shared animation independently.',
      'Animation should follow authoritative state. Input may request movement, movement determines velocity or position, and animation observes whether the actor is idle or walking. If key handlers directly play animations, pointer control and AI will eventually produce inconsistent visuals.',
      'Tweens interpolate a property such as position, alpha or scale over time. They are excellent for presentation but dangerous as hidden gameplay rules. Damage should be applied by combat code; a flash or recoil tween should merely communicate that damage.'
    ],
    conceptSections: [
      {
        title: 'Define shared animations once',
        paragraphs: [
          'The Animation Manager is shared across scenes. Starting a scene again does not require creating the same definition again, so guard creation with exists(). The Sprite’s play() method then starts or continues that definition.',
          'generateFrameNumbers selects numeric frames from a regular spritesheet. Its end index is inclusive.'
        ],
        code: {
          filename: 'animation-definition.ts',
          language: 'ts',
          source: `if (!this.anims.exists('trainee-walk')) {
  this.anims.create({
    key: 'trainee-walk',
    frames: this.anims.generateFrameNumbers('trainee-sheet', {
      start: 0,
      end: 3
    }),
    frameRate: 8,
    repeat: -1
  });
}`
        },
        takeaway: 'An animation definition is shared data; playback belongs to each sprite.'
      },
      {
        title: 'Let state choose presentation',
        paragraphs: [
          'For this arena, the state can be derived from the normalised movement direction. When it is zero, stop the walk animation and choose a stable idle frame. When it is non-zero, play the walk animation. Passing true to play prevents the animation restarting on every update.',
          'Flipping one right-facing animation is a reasonable early economy. Separate directional artwork can be introduced when the visual style requires it.'
        ],
        code: {
          filename: 'animation-state.ts',
          language: 'ts',
          source: `function updatePresentation(
  sprite: Phaser.GameObjects.Sprite,
  direction: Phaser.Math.Vector2
): void {
  const isMoving = direction.lengthSq() > 0;

  if (!isMoving) {
    sprite.anims.stop();
    sprite.setFrame(0);
    return;
  }

  sprite.setFlipX(direction.x < 0);
  sprite.play('trainee-walk', true);
}`
        }
      },
      {
        title: 'Choose the right animation mechanism',
        paragraphs: [
          'Use frame animation when the artwork itself changes, such as feet moving. Use a tween for a continuous visual property such as a pulse, fade or small recoil. Use the update loop for movement governed by input and rules. These mechanisms can coexist, but each should have one job.',
          'Effects should normally be interruptible and short. A long unskippable tween attached to gameplay movement makes input feel delayed and can put the visual position out of agreement with the model.'
        ],
        code: {
          filename: 'readable-feedback.ts',
          language: 'ts',
          source: `function showHitFeedback(sprite: Phaser.GameObjects.Sprite): void {
  sprite.setTint(0xff9270);

  sprite.scene.tweens.add({
    targets: sprite,
    scaleX: sprite.scaleX * 1.15,
    scaleY: sprite.scaleY * 1.15,
    duration: 60,
    yoyo: true,
    onComplete: () => sprite.clearTint()
  });
}

// Damage is calculated elsewhere. This function only communicates it.`
        },
        takeaway: 'Presentation may reveal a rule outcome; it should not secretly own the outcome.'
      }
    ],
    code: {
      filename: 'src/scenes/TrainingArena.ts',
      language: 'ts',
      source: `create(): void {
  this.player = this.add.sprite(320, 180, 'trainee-sheet', 0).setScale(4);

  if (!this.anims.exists('trainee-walk')) {
    this.anims.create({
      key: 'trainee-walk',
      frames: this.anims.generateFrameNumbers('trainee-sheet', {
        start: 0,
        end: 3
      }),
      frameRate: 8,
      repeat: -1
    });
  }
}

update(_time: number, delta: number): void {
  const direction = this.inputAdapter.readMove();

  moveActor(this.player, direction, 160, delta);

  if (direction.lengthSq() === 0) {
    this.player.anims.stop();
    this.player.setFrame(0);
  } else {
    this.player.setFlipX(direction.x < 0);
    this.player.play('trainee-walk', true);
  }
}`
    },
    demo: {
      kind: 'animation',
      title: 'Animation state bench',
      description: 'Switch between idle and walking, change playback rate, and trigger a hit effect. Notice that the actor state and the temporary effect remain separate.'
    },
    exercises: [
      { id: 'l7-guided', kind: 'guided', title: 'Animate the trainee', description: 'Load a four-frame walk spritesheet, create the animation once, play it only while movement intent is non-zero, return to a chosen idle frame when stopped, and flip the sprite for leftward travel.' },
      { id: 'l7-challenge', kind: 'challenge', title: 'Add readable interaction feedback', description: 'Place an interactive training beacon in the arena. On interaction, give it a short pulse or flash and display a brief confirmation. Keep the interaction result independent from the tween.' },
      { id: 'l7-integration', kind: 'integration', title: 'Write the presentation policy', description: 'Document which behaviours use frame animation, tweens and update-driven movement. Restart the arena repeatedly to prove animation definitions are not duplicated, then commit the animated character and effect.' }
    ],
    review: [
      'What is shared by all sprites playing an animation, and what belongs to each individual sprite?',
      'Why should play() use ignoreIfPlaying when called from update?',
      'What happens if create() attempts to register an existing global animation key?',
      'Could the movement system function correctly if every animation were disabled?',
      'Does the feedback effect communicate an event without becoming the event’s source of truth?'
    ],
    resources: [
      { label: 'Phaser animations', url: 'https://docs.phaser.io/phaser/concepts/animations', note: 'Official guide to frames, definitions, playback and timing.' },
      { label: 'Phaser textures', url: 'https://docs.phaser.io/phaser/concepts/textures', note: 'How spritesheets are represented as textures and frames.' }
    ]
  },
  8: {
    lead: 'The foundations project becomes a small game when its screens, rules and transitions form a coherent loop. This lesson joins title, arena, pause and results scenes while making ownership of run data explicit.',
    outcomes: [
      'Distinguish scene lifecycle state from game-domain state',
      'Design an explicit title → play → results → replay flow',
      'Pass typed data between scenes without global variables',
      'Choose deliberately among scene-local data, transition data and the game registry',
      'Complete and assess the independent Training Arena project'
    ],
    concept: [
      'Phaser scene status describes whether a scene is running, paused, sleeping or stopped. Game-domain state describes facts meaningful to the player: remaining time, collected beacons, victory and score. They influence one another, but they are not the same thing.',
      'A scene transition should be a visible command with a small typed payload. The arena can start the results scene with a RunResult; the results scene should not reach back into a stopped arena and inspect its private fields.',
      'Not every value belongs in the global registry. Scene-local objects suit temporary implementation details; transition data suits a result handed to the next screen; the registry suits genuinely game-wide settings or progression that several scenes must observe.'
    ],
    conceptSections: [
      {
        title: 'Draw the legal flow before coding it',
        paragraphs: [
          'A small state diagram exposes missing transitions and accidental routes. The training game begins at the title, starts a fresh run, may temporarily pause and resume that same run, then reaches results. Results may start a new run or return to title.',
          'Pause is modal rather than a new run state: the arena remains visible and retains its data while its update systems are suspended.'
        ],
        code: {
          filename: 'scene-flow.txt',
          language: 'text',
          source: `Title ──start──> Arena ──finish──> Results
                   │  ▲                 │
                pause resume          replay
                   ▼  │                 │
                   Pause <──────────────┘

Results ──menu──> Title`
        },
        takeaway: 'A transition not present in the diagram should require a deliberate design decision.'
      },
      {
        title: 'Use types as scene contracts',
        paragraphs: [
          'The receiving scene declares the data it needs; the sending scene constructs an object of exactly that type. A runtime assertion remains valuable because Phaser scene data can originate from JavaScript, saved data or a mistyped general scene API.',
          'Keep transition payloads small. Pass the run result, not the entire ArenaScene instance.'
        ],
        code: {
          filename: 'src/state/RunResult.ts',
          language: 'ts',
          source: `export type RunResult = Readonly<{
  outcome: 'victory' | 'abandoned';
  beaconsCollected: number;
  elapsedMs: number;
}>;

export function isRunResult(value: unknown): value is RunResult {
  if (!value || typeof value !== 'object') return false;

  const result = value as Partial<RunResult>;

  return (
    (result.outcome === 'victory' || result.outcome === 'abandoned') &&
    typeof result.beaconsCollected === 'number' &&
    typeof result.elapsedMs === 'number'
  );
}`
        }
      },
      {
        title: 'Give each kind of state an owner',
        paragraphs: [
          'The arena owns the current run timer and beacon objects because they die with that run. Results receives an immutable summary. Settings such as reduced motion or audio volume may live in the registry because several scenes need them and they outlive a run.',
          'Avoid a single untyped “gameState” object containing everything. Broad global state makes it difficult to know which scene may change a value or when it should reset.'
        ],
        code: {
          filename: 'state-ownership.ts',
          language: 'ts',
          source: `// Scene-local: reset whenever a new arena run starts
private elapsedMs = 0;
private beaconsCollected = 0;

// Transition data: immutable summary for the next scene
const result: RunResult = {
  outcome: 'victory',
  beaconsCollected: this.beaconsCollected,
  elapsedMs: this.elapsedMs
};

this.scene.start('results', result);

// Registry: genuinely cross-scene preference
this.registry.set('reducedMotion', true);`
        },
        takeaway: 'The narrowest suitable owner usually produces the clearest reset behaviour.'
      },
      {
        title: 'Stop, pause and restart with intent',
        paragraphs: [
          'Starting results from the arena stops the arena and begins a clean results scene. Launching pause alongside the arena and pausing the arena preserves the current run. Replaying should start a fresh arena lifecycle so its run counters reset in init or create.',
          'Cleanup is part of the flow. Listeners attached to window, game.events or a custom long-lived emitter must be removed during shutdown; listeners owned by destroyed game objects disappear with those objects.'
        ],
        code: {
          filename: 'scene-transitions.ts',
          language: 'ts',
          source: `// Arena -> Pause, preserving the arena
this.scene.pause('arena');
this.scene.launch('pause', { returnTo: 'arena' });

// Arena -> Results, ending the run
this.scene.start('results', result);

// Results -> fresh Arena
this.scene.start('arena');`
        }
      }
    ],
    code: {
      filename: 'src/scenes/ResultsScene.ts',
      language: 'ts',
      source: `export class ResultsScene extends Phaser.Scene {
  private result!: RunResult;

  constructor() {
    super('results');
  }

  init(data: unknown): void {
    if (!isRunResult(data)) {
      throw new Error('ResultsScene requires a valid RunResult');
    }

    this.result = data;
  }

  create(): void {
    const seconds = (this.result.elapsedMs / 1000).toFixed(1);

    this.add.text(320, 90, 'TRAINING COMPLETE').setOrigin(0.5);
    this.add.text(
      320,
      140,
      'Beacons: ' + this.result.beaconsCollected + ' · Time: ' + seconds + 's'
    ).setOrigin(0.5);

    const replay = this.add.text(320, 210, 'Replay').setOrigin(0.5).setInteractive();
    replay.on('pointerup', () => this.scene.start('arena'));

    const menu = this.add.text(320, 250, 'Return to title').setOrigin(0.5).setInteractive();
    menu.on('pointerup', () => this.scene.start('title'));
  }
}`
    },
    demo: {
      kind: 'scene-flow',
      title: 'Scene-flow console',
      description: 'Drive a miniature title, arena, pause and results loop. The event log distinguishes a preserved paused scene from a stopped run and a fresh restart.'
    },
    exercises: [
      { id: 'l8-guided', kind: 'guided', title: 'Complete the scene loop', description: 'Connect title, arena, your existing pause scene and a new results scene. The arena must finish with a typed RunResult, results must validate it, and replay must start a fresh run.' },
      { id: 'l8-challenge', kind: 'challenge', title: 'Build from a specification', description: 'Without copying the lesson implementation, add three collectible training beacons, a visible timer and a completion condition. The result screen must report collected beacons and elapsed time; returning to title and replaying must not retain stale run data.' },
      { id: 'l8-integration', kind: 'integration', title: 'Assess and release the Training Arena', description: 'Run the foundation assessment checklist, test at least three unusual transitions, make a production build, add controls and architecture notes to README, and tag or commit the finished Stage 0 project.' }
    ],
    review: [
      'Which values belong to one arena run, which cross a transition, and which genuinely belong to the whole game?',
      'Does replay create a fresh timer, beacon count and set of game objects?',
      'Can pause be opened repeatedly without accumulating listeners or duplicate scenes?',
      'What happens if ResultsScene is started without valid data?',
      'Can every legal transition be explained from the scene-flow diagram?',
      'Could another developer run the production build and understand the controls from README alone?'
    ],
    resources: [
      { label: 'Phaser scene lifecycle', url: 'https://docs.phaser.io/phaser/concepts/scenes', note: 'Scene status, transition operations and rendering order.' },
      { label: 'Phaser game registry', url: 'https://docs.phaser.io/phaser/concepts/game', note: 'Game-wide data storage and when it is shared across scenes.' }
    ]
  }
};

const makeLesson = (id: number, title: string, summary: string, duration = '60–90 min'): Lesson => ({
  id,
  title,
  summary,
  duration,
  status: authored[id] ? 'authored' : 'outline',
  content: authored[id]
});

const fromPairs = (start: number, pairs: [string, string][]): Lesson[] =>
  pairs.map(([title, summary], index) => makeLesson(start + index, title, summary));

export const stages: Stage[] = [
  {
    id: 0,
    title: 'Foundations',
    project: 'Training Arena',
    range: 'Lessons 01–08',
    accent: '#e4ff70',
    goal: 'Understand how a Phaser game runs and create small interactive scenes independently.',
    deliverable: 'An original interactive training arena built from a specification.',
    lessons: fromPairs(1, [
      ['Environment & project setup', 'Build a reproducible Phaser 4 and strict TypeScript workshop.'],
      ['Game configuration & scenes', 'Understand scene lifecycle, configuration and transitions.'],
      ['Coordinates & rendering', 'Reason about positions, origins, grids and crisp rendering.'],
      ['Keyboard & pointer input', 'Translate physical controls into clean player intent.'],
      ['The game loop & delta time', 'Create frame-rate-independent movement and reason about time.'],
      ['Sprites & asset discipline', 'Load, scale and document pixel-art assets correctly.'],
      ['Animation & simple effects', 'Build animation state and readable visual feedback.'],
      ['Game states & scene flow', 'Join title, play, pause and result states into a small game.']
    ])
  },
  {
    id: 1,
    title: 'Arena Survivor',
    project: 'Portfolio Game 1',
    range: 'Lessons 09–20',
    accent: '#ff9270',
    goal: 'Build and release a complete real-time game with meaningful progression.',
    deliverable: 'A polished browser game with upgrades, audio, menus, restart and documented design choices.',
    lessons: fromPairs(9, [
      ['Velocity & movement vectors', 'Move an actor using speed, direction and intent.'],
      ['Boundaries & camera space', 'Keep play readable and actors inside valid space.'],
      ['Collision fundamentals', 'Model overlaps, separation and collision layers.'],
      ['Arcade Physics in practice', 'Use bodies, groups and callbacks without tangling rules.'],
      ['Enemy spawning & pacing', 'Control population through waves, budgets and spawn safety.'],
      ['Chase AI, health & damage', 'Create readable pursuit and a robust damage pipeline.'],
      ['Weapons & cooldowns', 'Model repeatable attacks independently of presentation.'],
      ['Projectiles & experience', 'Pool projectiles and turn defeated enemies into progression.'],
      ['Upgrade selection', 'Offer choices that change play rather than inflate numbers.'],
      ['Difficulty scaling', 'Shape pressure with curves, caps and playtest evidence.'],
      ['Game feel, sound & feedback', 'Add impact through timing, motion, audio and restraint.'],
      ['Testing, packaging & release', 'Ship a stable build and present engineering decisions.']
    ])
  },
  {
    id: 2,
    title: 'Dungeon Delver',
    project: 'Portfolio Game 2',
    range: 'Lessons 21–34',
    accent: '#70d7ff',
    goal: 'Create a persistent world with interconnected exploration and RPG systems.',
    deliverable: 'A short RPG with combat, inventory, multiple areas, NPCs and persistent character development.',
    lessons: fromPairs(21, [
      ['Tilemaps & tilesets', 'Build worlds from tiles while respecting asset constraints.'],
      ['Tiled workflow', 'Design, export and validate a map with useful metadata.'],
      ['Camera following & bounds', 'Frame exploration and control what the player can see.'],
      ['World collision & transitions', 'Connect areas safely and preserve entry context.'],
      ['Characters & interaction', 'Detect, prioritise and communicate interactable targets.'],
      ['Animation state', 'Drive animation from state instead of scattered conditions.'],
      ['Items & inventory rules', 'Model ownership, capacity and item behaviour as pure rules.'],
      ['Equipment & statistics', 'Compose modifiers and expose meaningful trade-offs.'],
      ['RPG combat', 'Resolve attacks through a testable rules pipeline.'],
      ['Status effects & enemy states', 'Model temporary effects and finite-state behaviour.'],
      ['Dialogue & choices', 'Represent branching conversations as data.'],
      ['Quests & data-driven content', 'Track objectives without hard-coding every mission.'],
      ['Save, load & migration', 'Persist campaign data and evolve its schema safely.'],
      ['UI architecture & testing', 'Connect game rules to accessible, maintainable interfaces.']
    ])
  },
  {
    id: 3,
    title: 'Tactical Operations',
    project: 'Portfolio Game 3',
    range: 'Lessons 35–49',
    accent: '#c7a0ff',
    goal: 'Understand the algorithms and architecture behind turn-based tactical combat.',
    deliverable: 'A multi-mission tactics game with AI and a deterministic, testable rules engine.',
    lessons: fromPairs(35, [
      ['Grid coordinate systems', 'Convert among world, screen and cell coordinates.'],
      ['Occupancy & terrain data', 'Represent what each cell contains and permits.'],
      ['Turn sequencing', 'Build an explicit, inspectable turn state machine.'],
      ['Actions & action points', 'Validate and spend a limited turn budget.'],
      ['Movement ranges', 'Discover reachable cells with weighted costs.'],
      ['A* pathfinding', 'Find efficient paths and test graph edge cases.'],
      ['Line of sight', 'Trace visibility through a discrete battlefield.'],
      ['Range, cover & terrain', 'Turn spatial context into tactical decisions.'],
      ['Hit probability', 'Communicate uncertainty honestly and consistently.'],
      ['Damage & status effects', 'Resolve tactical consequences deterministically.'],
      ['Enemy decision-making', 'Generate valid actions before judging them.'],
      ['Utility scoring', 'Balance damage, position, objectives and risk.'],
      ['Squads & abilities', 'Coordinate specialised units and reusable commands.'],
      ['Objectives & combat logs', 'Support missions beyond elimination with explainable outcomes.'],
      ['Replay, testing & balance', 'Use seeds and action logs to reproduce every battle.']
    ])
  },
  {
    id: 4,
    title: 'Mercenary Company',
    project: 'Portfolio Game 4',
    range: 'Lessons 50–62',
    accent: '#ffc857',
    goal: 'Build a management game driven by long-term decisions and progression.',
    deliverable: 'A replayable campaign with an explainable economy and balancing evidence.',
    lessons: fromPairs(50, [
      ['Campaign state', 'Define the authoritative model for a long-running company.'],
      ['Management UI', 'Turn dense state into clear, decision-focused screens.'],
      ['Recruitment systems', 'Generate candidates with readable strengths and costs.'],
      ['Procedural characters', 'Create varied people without meaningless noise.'],
      ['Resources & scarcity', 'Make money, time and supplies compete.'],
      ['Contracts & economy', 'Price risk, reward and opportunity cost.'],
      ['Experience & skills', 'Build progression with identity and trade-offs.'],
      ['Injuries & recovery', 'Create setbacks that produce stories, not dead time.'],
      ['Equipment & upgrades', 'Link investment choices to company strategy.'],
      ['Difficulty curves', 'Maintain pressure without invalidating progress.'],
      ['Procedural missions', 'Assemble missions from constrained, testable rules.'],
      ['Balancing simulations', 'Run hundreds of campaigns to expose systemic drift.'],
      ['Persistence, optimisation & release', 'Ship a durable campaign and profile its bottlenecks.']
    ])
  },
  {
    id: 5,
    title: 'Professional Capstone',
    project: 'Independent Release',
    range: 'Lessons 63–72',
    accent: '#72f1b8',
    goal: 'Own an entire game project and the decisions a tutorial normally makes for you.',
    deliverable: 'A polished release, source, documentation, automated checks, gameplay video and retrospective.',
    lessons: fromPairs(63, [
      ['Game design documents', 'Turn an idea into decisions, constraints and testable claims.'],
      ['Prototype validation', 'Use the smallest experiment that can disprove an assumption.'],
      ['Architecture & boundaries', 'Design systems around change rather than fashion.'],
      ['Refactoring & technical debt', 'Improve structure with tests and measured intent.'],
      ['Performance profiling', 'Find bottlenecks with evidence rather than intuition.'],
      ['Memory & object pooling', 'Control allocation in high-frequency systems.'],
      ['Automated tests & CI', 'Protect rules and builds on every change.'],
      ['Accessibility & input options', 'Make play flexible, legible and configurable.'],
      ['Production builds & deployment', 'Create repeatable, versioned releases.'],
      ['Telemetry & portfolio presentation', 'Learn from play while presenting the work professionally.']
    ])
  }
];

export const allLessons = stages.flatMap((stage) => stage.lessons);
export const lessonById = (id: number): Lesson => allLessons.find((lesson) => lesson.id === id) ?? allLessons[0];
export const stageForLesson = (id: number): Stage => stages.find((stage) => stage.lessons.some((lesson) => lesson.id === id)) ?? stages[0];
