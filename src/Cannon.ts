import { Bullet } from "./Bullet";
import { CANNON_SPRITE, PIXELS_PER_METER } from "./constants";
import { GameScene } from "./GameScene";

const INITIAL_SPEED_M_PER_S = 35; // Initial speed of the bullet in m/s
const CANNON_ELEVATION_ANGLE = Phaser.Math.DegToRad(20); // Angle above horizontal plane
const MUZZLE_HEIGHT_METERS = 0.5; // Height of the cannon muzzle above ground in meters

export class Cannon extends Phaser.Physics.Arcade.Image {
  world: GameScene;

  constructor(world: GameScene, x: number, y: number) {
    super(world, x, y, CANNON_SPRITE);
    this.world = world;
    world.add.existing(this);
    this.setOrigin(0.5, 1); // Origin at bottom center
    this.setDepth(y * 10); // Basic depth based on Y
  }

  // Shoots towards a target X/Y point on the ground plane
  shoot(targetX: number, targetY: number): Bullet {
    // Calculate horizontal angle from cannon to target
    const angleRad = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      targetX,
      targetY
    );

    // Calculate initial velocity components based on total speed and elevation
    const horizontalSpeed =
      INITIAL_SPEED_M_PER_S *
      PIXELS_PER_METER *
      Math.cos(CANNON_ELEVATION_ANGLE);

    const initialVX = horizontalSpeed * Math.cos(angleRad); // X component of horizontal speed
    const initialVY = horizontalSpeed * Math.sin(angleRad); // Y component of horizontal speed
    const initialVZ =
      PIXELS_PER_METER *
      INITIAL_SPEED_M_PER_S *
      Math.sin(CANNON_ELEVATION_ANGLE); // Vertical component

    // Create the bullet instance (assuming cannon shoots from slightly above ground z=0)
    const bullet = new Bullet(
      this.world,
      this.x,
      this.y,
      MUZZLE_HEIGHT_METERS * PIXELS_PER_METER, // Start position
      initialVX,
      initialVY,
      initialVZ
    );
    return bullet;
  }
}
