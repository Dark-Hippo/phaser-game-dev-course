import * as Phaser from 'phaser';
import type { DemoKind } from './types';

type Cleanup = () => void;

const config = (parent: HTMLElement, scene: typeof Phaser.Scene): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: 640,
  height: 300,
  backgroundColor: '#0b100e',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene
});

function mountBoot(host: HTMLElement): Cleanup {
  let bootNumber = 0;
  let game: Phaser.Game | undefined;
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar"><span class="telemetry">Renderer: starting…</span><button type="button">Restart instance</button></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;
  const button = host.querySelector<HTMLButtonElement>('button')!;

  const start = () => {
    game?.destroy(true);
    canvas.replaceChildren();
    bootNumber += 1;
    class BootDemo extends Phaser.Scene {
      create(): void {
        const graphics = this.add.graphics();
        for (let x = 0; x < 640; x += 32) {
          for (let y = 0; y < 300; y += 32) {
            const colour = (x + y) % 64 === 0 ? 0x18231e : 0x141c18;
            graphics.fillStyle(colour).fillRect(x, y, 31, 31);
          }
        }
        const core = this.add.rectangle(320, 150, 72, 72, 0xe4ff70).setStrokeStyle(4, 0x0b100e);
        this.tweens.add({ targets: core, angle: 360, duration: 2400, repeat: -1, ease: 'Sine.inOut' });
        this.add.text(320, 54, 'WORKSHOP ONLINE', { fontFamily: 'monospace', fontSize: '22px', color: '#f3f5ec' }).setOrigin(0.5);
        this.add.text(320, 245, `boot sequence ${String(bootNumber).padStart(2, '0')}`, { fontFamily: 'monospace', fontSize: '16px', color: '#8f9b93' }).setOrigin(0.5);
        telemetry.textContent = `Renderer: ${this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'} · ${this.scale.width}×${this.scale.height}`;
      }
    }
    game = new Phaser.Game(config(canvas, BootDemo));
  };
  button.addEventListener('click', start);
  start();
  return () => game?.destroy(true);
}

function mountScenes(host: HTMLElement): Cleanup {
  let game: Phaser.Game;
  let controlState: 'running' | 'paused' = 'running';
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar scene-controls"><button data-action="start">Start</button><button data-action="pause">Pause</button><button data-action="resume">Resume</button><button data-action="restart">Restart</button><span class="telemetry">State: booting</span></div><ol class="event-log" aria-label="Scene event log"></ol>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const log = host.querySelector<HTMLOListElement>('.event-log')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;
  const addLog = (message: string) => {
    const item = document.createElement('li');
    item.textContent = message;
    log.prepend(item);
    while (log.children.length > 4) log.lastElementChild?.remove();
  };

  class LifecycleDemo extends Phaser.Scene {
    private actor?: Phaser.GameObjects.Rectangle;
    private ticks = 0;
    create(): void {
      controlState = 'running';
      this.ticks = 0;
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      this.actor = this.add.rectangle(90, 150, 28, 28, 0xff9270);
      this.add.text(20, 18, 'PATROL SCENE', { fontFamily: 'monospace', fontSize: '18px', color: '#f3f5ec' });
      addLog('create() built a fresh scene');
      telemetry.textContent = 'State: running';
    }
    update(_time: number, delta: number): void {
      if (!this.actor) return;
      this.actor.x += delta * 0.08;
      if (this.actor.x > 660) this.actor.x = -20;
      this.ticks += 1;
      if (controlState === 'running' && this.ticks % 45 === 0) telemetry.textContent = `State: running · update ${this.ticks}`;
    }
  }
  game = new Phaser.Game(config(canvas, LifecycleDemo));
  const control = (event: Event) => {
    const action = (event.target as HTMLElement).dataset.action;
    const scene = game.scene.getScene('default');
    if (!scene) return;
    if (action === 'pause') { controlState = 'paused'; scene.scene.pause(); telemetry.textContent = 'State: paused'; addLog('pause() stopped update'); }
    if (action === 'resume') { controlState = 'running'; scene.scene.resume(); telemetry.textContent = 'State: running'; addLog('resume() continued the scene'); }
    if (action === 'restart') { scene.scene.restart(); addLog('restart() requested'); }
    if (action === 'start') { if (!scene.scene.isActive()) scene.scene.start(); addLog('start() requested'); }
  };
  host.querySelector('.scene-controls')?.addEventListener('click', control);
  return () => game.destroy(true);
}

function mountCoordinates(host: HTMLElement): Cleanup {
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar"><span class="telemetry">Move inside the field</span><span class="distance">No beacon placed</span></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;
  const distance = host.querySelector<HTMLElement>('.distance')!;
  class CoordinateDemo extends Phaser.Scene {
    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.9);
      const cross = this.add.graphics();
      const beacon = this.add.circle(0, 0, 7, 0x70d7ff).setVisible(false);
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        cross.clear().lineStyle(1, 0xe4ff70, 0.8);
        cross.lineBetween(pointer.x - 9, pointer.y, pointer.x + 9, pointer.y);
        cross.lineBetween(pointer.x, pointer.y - 9, pointer.x, pointer.y + 9);
        telemetry.textContent = `x ${Math.round(pointer.x)} · y ${Math.round(pointer.y)} · cell ${Math.floor(pointer.x / 32)},${Math.floor(pointer.y / 32)}`;
      });
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        beacon.setPosition(pointer.x, pointer.y).setVisible(true);
        distance.textContent = `Beacon distance: ${Math.hypot(pointer.x, pointer.y).toFixed(1)} px`;
      });
    }
  }
  const game = new Phaser.Game(config(canvas, CoordinateDemo));
  return () => game.destroy(true);
}

function mountInput(host: HTMLElement): Cleanup {
  let inputMode: 'keyboard' | 'pointer' | 'hybrid' = 'keyboard';
  host.innerHTML = '<div class="demo-canvas" tabindex="0" aria-label="Keyboard and pointer intent demonstration"></div><div class="demo-toolbar input-controls"><span>Control policy</span><button data-mode="keyboard" aria-pressed="true">Keyboard</button><button data-mode="pointer">Pointer</button><button data-mode="hybrid">Hybrid</button><span class="input-instruction">Focus arena; use WASD or arrows</span><span class="telemetry">keyboard · intent 0.00, 0.00 · length 0.00</span></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const toolbar = host.querySelector<HTMLElement>('.input-controls')!;
  const instruction = host.querySelector<HTMLElement>('.input-instruction')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;
  class InputDemo extends Phaser.Scene {
    private actor?: Phaser.GameObjects.Rectangle;
    private pointerMarker?: Phaser.GameObjects.Arc;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: Record<string, Phaser.Input.Keyboard.Key>;
    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.9);
      this.actor = this.add.rectangle(320, 150, 28, 28, 0xe4ff70).setStrokeStyle(3, 0x111714);
      this.pointerMarker = this.add.circle(0, 0, 10, 0x70d7ff, 0.2).setStrokeStyle(2, 0x70d7ff).setVisible(false);
      this.cursors = this.input.keyboard?.createCursorKeys();
      this.keys = this.input.keyboard?.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    }
    update(_time: number, delta: number): void {
      if (!this.actor || !this.pointerMarker || !this.cursors || !this.keys) return;
      const keyboardX = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
      const keyboardY = Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown);
      const keyboardLength = Math.hypot(keyboardX, keyboardY);
      const normalKeyboardX = keyboardLength ? keyboardX / keyboardLength : 0;
      const normalKeyboardY = keyboardLength ? keyboardY / keyboardLength : 0;

      const pointer = this.input.activePointer;
      pointer.updateWorldPoint(this.cameras.main);
      const pointerX = pointer.worldX - this.actor.x;
      const pointerY = pointer.worldY - this.actor.y;
      const pointerDistance = Math.hypot(pointerX, pointerY);
      const pointerActive = pointer.isDown && pointerDistance > 12;
      const normalPointerX = pointerActive ? pointerX / pointerDistance : 0;
      const normalPointerY = pointerActive ? pointerY / pointerDistance : 0;
      this.pointerMarker.setPosition(pointer.worldX, pointer.worldY).setVisible(pointer.isDown && inputMode !== 'keyboard');

      let rawX = 0;
      let rawY = 0;
      let source: string = inputMode;
      if (inputMode === 'keyboard') {
        rawX = normalKeyboardX;
        rawY = normalKeyboardY;
      } else if (inputMode === 'pointer') {
        rawX = normalPointerX;
        rawY = normalPointerY;
      } else {
        rawX = normalKeyboardX + normalPointerX;
        rawY = normalKeyboardY + normalPointerY;
        if (keyboardLength > 0 && pointerActive) source = 'keyboard + pointer';
        else if (keyboardLength > 0) source = 'keyboard';
        else if (pointerActive) source = 'pointer';
      }

      const length = Math.hypot(rawX, rawY);
      const nx = length ? rawX / length : 0;
      const ny = length ? rawY / length : 0;
      this.actor.x = Phaser.Math.Clamp(this.actor.x + nx * delta * 0.16, 16, 624);
      this.actor.y = Phaser.Math.Clamp(this.actor.y + ny * delta * 0.16, 16, 284);
      telemetry.textContent = `${source} · intent ${nx.toFixed(2)}, ${ny.toFixed(2)} · length ${Math.hypot(nx, ny).toFixed(2)}`;
    }
  }
  canvas.addEventListener('pointerdown', () => canvas.focus());
  const game = new Phaser.Game(config(canvas, InputDemo));
  toolbar.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      if (mode !== 'keyboard' && mode !== 'pointer' && mode !== 'hybrid') return;
      inputMode = mode;
      toolbar.querySelectorAll('[data-mode]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      instruction.textContent = mode === 'keyboard'
        ? 'Focus arena; use WASD or arrows'
        : mode === 'pointer'
          ? 'Hold the pointer inside the arena'
          : 'Use keys and hold the pointer together';
    });
  });
  return () => game.destroy(true);
}

function mountDeltaTime(host: HTMLElement): Cleanup {
  let simulatedFps = 60;
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar demo-fps-controls"><span>Simulated updates</span><button data-fps="30">30 FPS</button><button data-fps="60" aria-pressed="true">60 FPS</button><button data-fps="120">120 FPS</button><span class="telemetry">Comparing movement…</span></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const toolbar = host.querySelector<HTMLElement>('.demo-fps-controls')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;

  class DeltaTimeDemo extends Phaser.Scene {
    private frameActor?: Phaser.GameObjects.Rectangle;
    private deltaActor?: Phaser.GameObjects.Rectangle;
    private accumulator = 0;
    private elapsed = 0;

    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      this.add.text(20, 35, 'FIXED PIXELS / FRAME', { fontFamily: 'monospace', fontSize: '13px', color: '#ff9270' });
      this.add.text(20, 165, 'PIXELS / SECOND × DELTA', { fontFamily: 'monospace', fontSize: '13px', color: '#e4ff70' });
      this.add.line(320, 102, -280, 0, 280, 0, 0x344139).setLineWidth(2);
      this.add.line(320, 232, -280, 0, 280, 0, 0x344139).setLineWidth(2);
      this.frameActor = this.add.rectangle(45, 102, 24, 24, 0xff9270);
      this.deltaActor = this.add.rectangle(45, 232, 24, 24, 0xe4ff70);
    }

    update(_time: number, delta: number): void {
      if (!this.frameActor || !this.deltaActor) return;
      this.accumulator += delta;
      this.elapsed += delta;
      const stepMs = 1000 / simulatedFps;

      while (this.accumulator >= stepMs) {
        this.frameActor.x += 2;
        this.deltaActor.x += 120 * (stepMs / 1000);
        this.accumulator -= stepMs;
      }

      if (this.frameActor.x > 610) this.frameActor.x = 45;
      if (this.deltaActor.x > 610) this.deltaActor.x = 45;

      if (this.elapsed >= 200) {
        telemetry.textContent = `${simulatedFps} FPS · frame rate speed ${simulatedFps * 2}px/s · delta speed 120px/s`;
        this.elapsed = 0;
      }
    }
  }

  const game = new Phaser.Game(config(canvas, DeltaTimeDemo));
  toolbar.querySelectorAll<HTMLButtonElement>('[data-fps]').forEach((button) => {
    button.addEventListener('click', () => {
      simulatedFps = Number(button.dataset.fps);
      toolbar.querySelectorAll('[data-fps]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  return () => game.destroy(true);
}

function mountSprites(host: HTMLElement): Cleanup {
  let scene: SpriteDemo | undefined;
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar sprite-controls"><span>Scale</span><button data-scale="4">4×</button><button data-scale="8" aria-pressed="true">8×</button><button data-scale="12">12×</button><button data-filter="nearest" aria-pressed="true">Nearest</button><button data-filter="linear">Linear</button><span class="telemetry">16×16 source · 128×128 display</span></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const toolbar = host.querySelector<HTMLElement>('.sprite-controls')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;

  class SpriteDemo extends Phaser.Scene {
    private actor?: Phaser.GameObjects.Sprite;
    private scaleFactor = 8;

    create(): void {
      scene = this;
      this.add.grid(320, 150, 640, 300, 16, 16, 0x0b100e, 1, 0x18231e, 0.75);
      const graphics = this.add.graphics();
      graphics.fillStyle(0x70d7ff).fillRect(5, 1, 6, 4);
      graphics.fillStyle(0xf3f5ec).fillRect(4, 5, 8, 6);
      graphics.fillStyle(0xe4ff70).fillRect(2, 7, 3, 5).fillRect(11, 7, 3, 5);
      graphics.fillStyle(0xff9270).fillRect(4, 11, 3, 5).fillRect(9, 11, 3, 5);
      graphics.fillStyle(0x111714).fillRect(6, 6, 1, 1).fillRect(9, 6, 1, 1);
      graphics.generateTexture('demo-trainee', 16, 16);
      graphics.destroy();
      this.textures.get('demo-trainee').setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.actor = this.add.sprite(320, 154, 'demo-trainee').setScale(this.scaleFactor);
      this.add.text(320, 260, 'SOURCE: 16 × 16 PIXELS', { fontFamily: 'monospace', fontSize: '12px', color: '#8f9b93' }).setOrigin(0.5);
    }

    setScaleFactor(value: number): void {
      this.scaleFactor = value;
      this.actor?.setScale(value);
      telemetry.textContent = `16×16 source · ${16 * value}×${16 * value} display`;
    }

    setFiltering(filter: 'nearest' | 'linear'): void {
      const mode = filter === 'nearest' ? Phaser.Textures.FilterMode.NEAREST : Phaser.Textures.FilterMode.LINEAR;
      this.textures.get('demo-trainee').setFilter(mode);
    }
  }

  const game = new Phaser.Game(config(canvas, SpriteDemo));
  toolbar.querySelectorAll<HTMLButtonElement>('button').forEach((target) => {
    target.addEventListener('click', () => {
      if (!scene) return;
      if (target.dataset.scale) {
        scene.setScaleFactor(Number(target.dataset.scale));
        toolbar.querySelectorAll('[data-scale]').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
      }
      if (target.dataset.filter === 'nearest' || target.dataset.filter === 'linear') {
        scene.setFiltering(target.dataset.filter);
        toolbar.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
      }
    });
  });
  return () => game.destroy(true);
}

function mountAnimation(host: HTMLElement): Cleanup {
  let scene: AnimationDemo | undefined;
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar animation-controls"><button data-state="idle" aria-pressed="true">Idle</button><button data-state="walking">Walk</button><button data-rate="4">4 FPS</button><button data-rate="8" aria-pressed="true">8 FPS</button><button data-rate="12">12 FPS</button><button data-effect="hit">Hit effect</button><span class="telemetry">State: idle</span></div>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const toolbar = host.querySelector<HTMLElement>('.animation-controls')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;

  class AnimationDemo extends Phaser.Scene {
    private actor?: Phaser.GameObjects.Sprite;
    private actorState: 'idle' | 'walking' = 'idle';
    private animationRate = 8;

    create(): void {
      scene = this;
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      for (let frame = 0; frame < 4; frame += 1) {
        const graphics = this.add.graphics();
        const offset = frame % 2;
        graphics.fillStyle(0x70d7ff).fillRect(5, 1, 6, 4);
        graphics.fillStyle(0xf3f5ec).fillRect(4, 5, 8, 6);
        graphics.fillStyle(0xe4ff70).fillRect(2 + offset, 7, 3, 5).fillRect(11 - offset, 7, 3, 5);
        graphics.fillStyle(0xff9270).fillRect(4 + offset, 11, 3, 5).fillRect(9 - offset, 11, 3, 5);
        graphics.fillStyle(0x111714).fillRect(6, 6, 1, 1).fillRect(9, 6, 1, 1);
        graphics.generateTexture(`demo-walk-${frame}`, 16, 16);
        graphics.destroy();
      }
      this.anims.create({
        key: 'demo-walk',
        frames: [0, 1, 2, 3].map((frame) => ({ key: `demo-walk-${frame}` })),
        frameRate: this.animationRate,
        repeat: -1
      });
      this.actor = this.add.sprite(140, 150, 'demo-walk-0').setScale(6);
      this.add.text(320, 35, 'STATE DRIVES PRESENTATION', { fontFamily: 'monospace', fontSize: '14px', color: '#f3f5ec' }).setOrigin(0.5);
      this.add.text(320, 260, 'The effect does not change the actor state', { fontFamily: 'monospace', fontSize: '12px', color: '#8f9b93' }).setOrigin(0.5);
    }

    update(_time: number, delta: number): void {
      if (!this.actor || this.actorState !== 'walking') return;
      this.actor.x += delta * 0.09;
      if (this.actor.x > 565) this.actor.x = 75;
    }

    setActorState(value: 'idle' | 'walking'): void {
      if (!this.actor) return;
      this.actorState = value;
      if (value === 'walking') this.actor.play('demo-walk', true);
      else {
        this.actor.anims.stop();
        this.actor.setTexture('demo-walk-0');
      }
      telemetry.textContent = `State: ${value} · animation ${this.animationRate} FPS`;
    }

    setAnimationRate(value: number): void {
      this.animationRate = value;
      if (this.actor) this.actor.anims.timeScale = value / 8;
      telemetry.textContent = `State: ${this.actorState} · animation ${value} FPS`;
    }

    showHitEffect(): void {
      if (!this.actor) return;
      this.tweens.killTweensOf(this.actor);
      this.actor.setScale(6).setTint(0xff9270);
      this.tweens.add({
        targets: this.actor,
        scaleX: 7,
        scaleY: 7,
        duration: 70,
        yoyo: true,
        onComplete: () => this.actor?.setScale(6).clearTint()
      });
    }
  }

  const game = new Phaser.Game(config(canvas, AnimationDemo));
  toolbar.querySelectorAll<HTMLButtonElement>('button').forEach((target) => {
    target.addEventListener('click', () => {
      if (!scene) return;
      if (target.dataset.state === 'idle' || target.dataset.state === 'walking') {
        scene.setActorState(target.dataset.state);
        toolbar.querySelectorAll('[data-state]').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
      }
      if (target.dataset.rate) {
        scene.setAnimationRate(Number(target.dataset.rate));
        toolbar.querySelectorAll('[data-rate]').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
      }
      if (target.dataset.effect) scene.showHitEffect();
    });
  });
  return () => game.destroy(true);
}

function mountSceneFlow(host: HTMLElement): Cleanup {
  host.innerHTML = '<div class="demo-canvas"></div><div class="demo-toolbar flow-controls"><button data-flow="begin">Begin</button><button data-flow="pause">Pause</button><button data-flow="resume">Resume</button><button data-flow="complete">Complete run</button><button data-flow="restart">Title</button><span class="telemetry">Scene: title</span></div><ol class="event-log" aria-label="Scene transition log"></ol>';
  const canvas = host.querySelector<HTMLElement>('.demo-canvas')!;
  const toolbar = host.querySelector<HTMLElement>('.flow-controls')!;
  const telemetry = host.querySelector<HTMLElement>('.telemetry')!;
  const log = host.querySelector<HTMLOListElement>('.event-log')!;
  const addLog = (message: string) => {
    const item = document.createElement('li');
    item.textContent = message;
    log.prepend(item);
    while (log.children.length > 4) log.lastElementChild?.remove();
  };
  const setState = (state: string) => { telemetry.textContent = `Scene: ${state}`; };

  class FlowTitle extends Phaser.Scene {
    constructor() { super('flow-title'); }
    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      this.add.text(320, 115, 'TRAINING ARENA', { fontFamily: 'monospace', fontSize: '26px', color: '#e4ff70' }).setOrigin(0.5);
      this.add.text(320, 165, 'Use Begin to start a fresh run', { fontFamily: 'monospace', fontSize: '13px', color: '#8f9b93' }).setOrigin(0.5);
      setState('title');
      addLog('Title started');
    }
  }
  class FlowArena extends Phaser.Scene {
    private actor?: Phaser.GameObjects.Rectangle;
    constructor() { super('flow-arena'); }
    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      this.actor = this.add.rectangle(80, 160, 28, 28, 0xe4ff70);
      this.add.text(18, 18, 'RUN IN PROGRESS', { fontFamily: 'monospace', fontSize: '14px', color: '#f3f5ec' });
      setState('arena · fresh run');
      addLog('Arena created with fresh state');
    }
    update(_time: number, delta: number): void {
      if (!this.actor) return;
      this.actor.x += delta * 0.1;
      if (this.actor.x > 660) this.actor.x = -20;
    }
  }
  class FlowPause extends Phaser.Scene {
    constructor() { super('flow-pause'); }
    create(): void {
      this.add.rectangle(320, 150, 640, 300, 0x050806, 0.75);
      this.add.text(320, 145, 'PAUSED', { fontFamily: 'monospace', fontSize: '28px', color: '#ffc857' }).setOrigin(0.5);
      setState('pause · arena preserved');
      addLog('Arena paused; Pause launched');
    }
  }
  class FlowResults extends Phaser.Scene {
    private score = 0;
    constructor() { super('flow-results'); }
    init(data: { score?: number }): void { this.score = data.score ?? 0; }
    create(): void {
      this.add.grid(320, 150, 640, 300, 32, 32, 0x0b100e, 1, 0x1d2a24, 0.8);
      this.add.text(320, 115, 'RUN COMPLETE', { fontFamily: 'monospace', fontSize: '26px', color: '#70d7ff' }).setOrigin(0.5);
      this.add.text(320, 165, `Beacons: ${this.score}`, { fontFamily: 'monospace', fontSize: '15px', color: '#f3f5ec' }).setOrigin(0.5);
      setState('results');
      addLog('Arena stopped; typed result received');
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: canvas,
    width: 640,
    height: 300,
    backgroundColor: '#0b100e',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [FlowTitle, FlowArena, FlowPause, FlowResults]
  });

  toolbar.querySelectorAll<HTMLButtonElement>('[data-flow]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.flow;
      if (action === 'begin') {
        game.scene.stop('flow-title');
        game.scene.stop('flow-results');
        game.scene.start('flow-arena');
      }
      if (action === 'pause' && game.scene.isActive('flow-arena')) {
        game.scene.pause('flow-arena');
        game.scene.start('flow-pause');
      }
      if (action === 'resume' && game.scene.isPaused('flow-arena')) {
        game.scene.stop('flow-pause');
        game.scene.resume('flow-arena');
        setState('arena · resumed');
        addLog('Pause stopped; Arena resumed');
      }
      if (action === 'complete' && (game.scene.isActive('flow-arena') || game.scene.isPaused('flow-arena'))) {
        game.scene.stop('flow-pause');
        game.scene.stop('flow-arena');
        game.scene.start('flow-results', { score: 3 });
      }
      if (action === 'restart') {
        game.scene.stop('flow-pause');
        game.scene.stop('flow-arena');
        game.scene.stop('flow-results');
        game.scene.start('flow-title');
      }
    });
  });
  return () => game.destroy(true);
}

export function mountDemo(kind: DemoKind, host: HTMLElement): Cleanup {
  if (kind === 'boot') return mountBoot(host);
  if (kind === 'scenes') return mountScenes(host);
  if (kind === 'coordinates') return mountCoordinates(host);
  if (kind === 'input') return mountInput(host);
  if (kind === 'delta-time') return mountDeltaTime(host);
  if (kind === 'sprites') return mountSprites(host);
  if (kind === 'animation') return mountAnimation(host);
  return mountSceneFlow(host);
}
