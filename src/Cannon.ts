import { Bullet } from "./Bullet";
import {
  CANNON_SPRITE,
  PIXELS_PER_METER,
  SMALL_WORLD_FACTOR,
  CANNON_SHADOW_SPRITE,
} from "./constants";
import { GameScene } from "./GameScene";

const PRE_RECOIL_DURATION_MS = 30;
const RECOIL_DURATION_MS = 50;
const RECOIL_RETURN_DURATION_MS = 500;
const RECOIL_FACTOR = 0.3;
const DO_RECOIL = true;

const INITIAL_SPEED_METERS_PER_SECOND = 440 / SMALL_WORLD_FACTOR;

export class Cannon extends Phaser.GameObjects.Sprite {
  gameScene: GameScene;
  private muzzleVelocity: Phaser.Math.Vector3 = new Phaser.Math.Vector3();
  private recoilTween: Phaser.Tweens.TweenChain | null = null;
  shadowSprite: Phaser.GameObjects.Image;
  elevation = Phaser.Math.DegToRad(15); // Muzzle elevation in radians
  initialX: number;
  initialY: number;
  cannonLength: number;
  cannonDiameter: number;
  barrelLength: number;

  constructor(gameScene: GameScene, x: number, y: number) {
    super(gameScene, x, y, CANNON_SPRITE);
    this.gameScene = gameScene;
    this.initialX = x;
    this.initialY = y;
    const originX = this.displayHeight / (2 * this.displayWidth);
    const originY = 0.5;
    this.setOrigin(originX, originY);

    this.cannonLength = this.displayWidth;
    this.cannonDiameter = this.displayHeight;
    this.barrelLength = this.cannonLength * (1 - this.originX);

    this.gameScene.add.existing(this);
    this.shadowSprite = this.gameScene.add
      .sprite(x, y, CANNON_SHADOW_SPRITE)
      .setAlpha(0.3);

    this.shadowSprite.setOrigin(originX, originY);

    this.setDepth(this.y);
    this.shadowSprite.setDepth(this.y - 1);
  }

  // Calculates the 3D muzzle velocity vector based on a target direction
  getMuzzleVelocity(
    direction: { worldX: number; worldY: number },
    out: Phaser.Math.Vector3
  ): Phaser.Math.Vector3 {
    const targetUntiltedY = this.gameScene.getUntiltedY(
      direction.worldX,
      direction.worldY
    );
    const cannonUntiltedY = this.gameScene.getUntiltedY(this.x, this.y);

    const azimuth = Phaser.Math.Angle.Between(
      this.x,
      cannonUntiltedY,
      direction.worldX,
      targetUntiltedY
    );

    const horizontalSpeedPixels =
      INITIAL_SPEED_METERS_PER_SECOND * PIXELS_PER_METER;

    const velocityHorizontal = horizontalSpeedPixels * Math.cos(this.elevation);
    const velocityX = velocityHorizontal * Math.cos(azimuth);
    const velocityY = velocityHorizontal * Math.sin(azimuth);
    const velocityZ = horizontalSpeedPixels * Math.sin(this.elevation);

    return out.set(velocityX, velocityY, velocityZ);
  }

  // Calculates the muzzle offset and spawn position based on current cannon state
  private calculateMuzzleSpawnPosition() {
    const cosElev = Math.cos(this.elevation);
    const sinElev = Math.sin(this.elevation);
    const cosAzim = Math.cos(this.shadowSprite.rotation); // Azimuth based on shadow
    const sinAzim = Math.sin(this.shadowSprite.rotation);

    const muzzleOffsetX = this.barrelLength * cosElev * cosAzim;
    const muzzleOffsetY = this.barrelLength * cosElev * sinAzim;
    const muzzleOffsetZ = this.barrelLength * sinElev;

    const spawnX = this.initialX + muzzleOffsetX;
    const spawnY =
      this.gameScene.getUntiltedY(this.initialX, this.initialY) + muzzleOffsetY;
    const spawnZ =
      this.gameScene.getGroundZ(this.initialX, this.initialY) + muzzleOffsetZ;

    return {
      muzzleOffsetX,
      muzzleOffsetY,
      muzzleOffsetZ,
      spawnX,
      spawnY,
      spawnZ,
    };
  }

  // Fires a bullet towards the given direction
  shoot(direction: { worldX: number; worldY: number }): Bullet | null {
    if (this.recoilTween) return null;

    const {
      x: velocityX,
      y: velocityY,
      z: velocityZ,
    } = this.getMuzzleVelocity(direction, this.muzzleVelocity);

    const muzzleAngle = Math.atan2(velocityY, velocityX);
    const recoilAngle = muzzleAngle + Math.PI;

    const recoilDistance = this.cannonLength * RECOIL_FACTOR;
    const recoilX = this.initialX + recoilDistance * Math.cos(recoilAngle);
    const recoilY = this.initialY + recoilDistance * Math.sin(recoilAngle);

    if (DO_RECOIL) {
      this.recoilTween = this.gameScene.tweens.chain({
        targets: [this, this.shadowSprite],
        tweens: [
          {
            delay: PRE_RECOIL_DURATION_MS,
            x: recoilX,
            y: recoilY,
            duration: RECOIL_DURATION_MS,
            ease: "Sine.easeOut",
          },
          {
            x: this.initialX,
            y: this.initialY,
            duration: RECOIL_RETURN_DURATION_MS,
            ease: "Sine.easeIn",
          },
        ],
        onComplete: () => {
          this.recoilTween = null;
        },
        onStop: () => {
          this.recoilTween = null;
          this.setPosition(this.initialX, this.initialY);
          this.shadowSprite.setPosition(this.initialX, this.initialY);
        },
      });
    }

    const { spawnX, spawnY, spawnZ } = this.calculateMuzzleSpawnPosition();

    return new Bullet(
      this.gameScene,
      spawnX,
      spawnY,
      spawnZ,
      velocityX,
      velocityY,
      velocityZ
    );
  }

  // Rotates the cannon sprite and shadow towards the mouse pointer
  rotate() {
    const {
      x: targetVelocityX,
      y: targetVelocityY,
      z: targetVelocityZ,
    } = this.getMuzzleVelocity(
      this.gameScene.input.activePointer,
      this.muzzleVelocity
    );

    // Visual rotation includes the tilt effect
    const visualTargetX = targetVelocityX;
    const visualTargetY = this.gameScene.getTiltedY(
      targetVelocityX,
      targetVelocityY,
      targetVelocityZ
    );
    this.rotation = Math.atan2(visualTargetY, visualTargetX);

    // Shadow rotation represents the actual horizontal aim (azimuth)
    this.shadowSprite.rotation = Math.atan2(targetVelocityY, targetVelocityX);

    // Calculate spawn position for visual scaling
    const { spawnX, spawnY, spawnZ } = this.calculateMuzzleSpawnPosition();

    const tiltedSpawnX = spawnX;
    const tiltedSpawnY = this.gameScene.getTiltedY(spawnX, spawnY, spawnZ);

    const originToMuzzleX = tiltedSpawnX - this.initialX;
    const originToMuzzleY = tiltedSpawnY - this.initialY;

    // Scale the cannon sprite visually based on the projected barrel length
    const visualBarrelLength = Math.sqrt(
      originToMuzzleX * originToMuzzleX + originToMuzzleY * originToMuzzleY
    );
    this.scaleX = visualBarrelLength / this.barrelLength;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Prevent rotation during recoil animation
    if (this.recoilTween === null) {
      this.rotate();
    }
  }
}
