export const TILE_HEIGHT_PX = 16;
export const SMALL_WORLD_FACTOR = 12; // slower ballistics so that it looks fun
export const BIG_WORLD_FACTOR = 4; // bigger ballistics so that it looks fun
export const WORLD_UNIT_PER_METER = 16; // World unit per meter. With our camera, 1px on x = 1 world unit
export const ENEMY_SPRITE = "enemy"; // Enemy sprite key
export const CANNON_SPRITE = "cannon"; // Cannon sprite key
export const BULLET_SPRITE = "bullet"; // Bullet sprite key
export const BULLET_RADIUS_METERS = 0.06;
export const CANNON_SHADOW_SPRITE = "cannon-shadow";
export const PARTICLE_SPRITE = "particle";
export const PIXEL_CANNON_SPRITE = "pixel-cannon";
export const CANNON_WHEELS_SPRITE = "cannon-wheels";
export const CANNON_WHEELS_SPRITE_ROTATION = Math.PI * 1.5; // to make it face right
export const FLARES = "flares";
export const PLAY_SOUNDS = true;
export const VISIBLE_UPDATE_INTERVAL = 1; // Target 60 FPS when visible
export const INVISIBLE_UPDATE_INTERVAL = 1000 / 10; // Target 10 FPS when invisible

// Angle (θ): The camera's pitch angle measured downwards from the horizontal plane (0° = horizontal, 90° = straight down).
// Orthographic Projection: A standard projection where parallel lines remain parallel.
// Y-Compression (sin θ): Represents how much the worldY axis (depth) is visually compressed along the screen's Y-axis relative to the worldX axis. A factor of 1 means no compression; 0.5 means it appears half as long.
// Z-Influence (cos θ): Represents how much worldZ (height) shifts the point along the screen's Y-axis (positive cos θ means positive worldZ decreases screenY, assuming screen Y increases downwards).
// Approximate Formula: screenY ≈ worldY * sin(θ) - worldZ * cos(θ)
// Floor-Aligned Projection (Y=1): A modified projection common in games where the Y-compression is removed (Y-Factor is forced to 1) for simpler ground-plane mapping.
// Z-Influence (cot θ): The adjusted factor for worldZ needed to maintain the original visual slant relative to the uncompressed worldY. (cot θ = cos θ / sin θ).
// Approximate Formula: screenY ≈ worldY * 1.0 - worldZ * cot(θ)

// Angle                 <---- Orthographic Projection ---->                <-- Floor-Aligned (Y=1) -->
// Perspective Name      (degrees)   Y-Compression   Z-Influence            Z-Influence                    Notes
//                       (θ)         (`sin θ`)       (`cos θ`)              (`cot θ`)
// ------------------    ---------   -------------   -----------            -----------                    ----------------------------------------------------------------------
// trueTopDown           90.0°       1.0000          0.0000                 0.0000                         No perspective effect. Z has no influence on screen Y position.
// zelda-high            85.0°       0.9962          0.0872                 0.0875                         Very slight perspective. Y barely compressed. Low Z influence.
// zelda-low             75.0°       0.9659          0.2588                 0.2679                         Mild perspective, common in many older JRPGs.
// threeQuarter          60.0°       0.8660          0.5000                 0.5774                         Significant perspective. Y noticeably compressed. Balanced Z influence.
// oblique               45.0°       0.7071          0.7071                 1.0000                         Balanced Orthographic factors. Floor-Aligned Z-factor matches Cavalier.
// trueIsometric         35.264°     0.5774          0.8165                 1.4142                         Mathematically precise Isometric angle. High Z influence.
// simpleIsometric       30.0°       0.5000          0.8660                 1.7321                         Common game Isometric. Y compressed by half. Very high Z influence.
// pixelArtIsometric     26.565°     0.4472          0.8944                 2.0000                         Used for 2:1 pixel art lines. Extreme Z influence when floor-aligned.
export const AXONOMETRIC = true; // Use axonometric projection (false for top-down)
export const PERSPECTIVE_INDEX = {
  // in parentheses: the ratio z/y lengths in non axonometric projection, length of the z axis in axonometric projection
  topDown: 90,
  zeldaHigh: 85,
  zeldaLow: 75,
  threeQuarter: 60,
  oblique: 45,
  trueIsometric: 35.264,
  simpleIsometric: 30,
  pixelArtIsometric: 26.565,
};
export const PERSPECTIVE = PERSPECTIVE_INDEX.threeQuarter;
