import { GameScene } from "../GameScene";

export function createCircleShape(
  gameScene: GameScene,
  key: string,
  color: number,
  diameter: number
) {
  const graphics = gameScene.make.graphics({}, false);
  graphics.fillStyle(color, 1);
  graphics.fillCircle(diameter / 2, diameter / 2, diameter / 2);
  graphics.generateTexture(key, diameter, diameter);
  graphics.destroy();
}
