const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 10240,
  heigth: 1000,
  backgroundColor: '#2500b9',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true
    },
    matter: {
      gravity: { y: 1 },
      enableSleep: false,
      debug: true
    }
  },
  pixelArt: false,
  render: {
    antialias: false,
  }
};

var score = 0;
var scoreText;
const game = new Phaser.Game(config);

function preload() {
  // Image layers from Tiled can't be exported to Phaser 3 (as yet)
  // So we add the background image separately
  // this.load.image('background', 'assets/images/background.png');

  this.load.image('sky1', 'assets/images/UpperSky.png')
  this.load.image('sky2', 'assets/images/MiddleSky.png')
  this.load.image('sky3', 'assets/images/LowerSky.png')
  this.load.image('cliffs', 'assets/images/Cliffs.png')
  this.load.spritesheet('waterfalltiles', 'assets/images/waterfall.png', { frameWidth: 3840, frameHeight: 40 })
  // this.load.image('water', 'assets/images/Water1.png')
  this.load.spritesheet('watertiles', 'assets/images/water.png', { frameWidth: 3840, frameHeight: 104 });
  // Load the tileset image file, needed for the map to know what
  // tiles to draw on the screen
  this.load.image('tiles', 'assets/tilesets/Sonic1_MD_Map_GHZ_blocks.png');
  // Even though we load the tilesheet with the spike image, we need to
  // load the Spike image separately for Phaser 3 to render it
  this.load.image('coin', 'assets/images/Ring1.png');
  // Load the export Tiled JSON
  this.load.tilemapTiledJSON('map', 'assets/tilemaps/GHZ.json');
  // Load player animations from the player spritesheet and atlas JSON
  this.load.atlas('player', 'assets/images/Sonic.png',
    'assets/images/Sonic.json');
  this.load.atlas('ring', 'assets/images/ring.png', 'assets/images/ring.json');
}

function create() {
  // Create a tile map, which is used to bring our level in Tiled
  // to our game world in Phaser
  const map = this.make.tilemap({ key: 'map' });
  // // Add the tileset to the map so the images would load correctly in Phaser
  const tileset = map.addTilesetImage('GHZ_Tiles', 'tiles');

  const sky1 = this.add.image(0, 0, 'sky1').setOrigin(0, 0).setScrollFactor(0.05);
  const sky2 = this.add.image(0, 0, 'sky2').setOrigin(0, -3).setScrollFactor(0.15);
  const sky3 = this.add.image(0, 0, 'sky3').setOrigin(0, -5.55).setScrollFactor(0.25);
  this.cliffs = this.add.image(0, 0, 'cliffs').setOrigin(0, -1.32).setScrollFactor(0.4);
  this.waterfall = this.add.sprite(0, 0, 'waterfalltiles').setOrigin(0, -4.75).setScrollFactor(0.7);
  this.water = this.add.sprite(0, 0, 'watertiles').setOrigin(0, -2.2).setScrollFactor(0.7);
  // const water = this.add.sprite(0, 0, 'water').setOrigin(0, -1.45);

  // Scale the image to better match our game's resolution
  sky1.setScale(2.5);
  sky2.setScale(2.5);
  sky3.setScale(2.5);
  this.cliffs.setScale(2.5);
  this.waterfall.setScale(2.5);
  this.water.setScale(2.5);
  // this.physics.enable(this.water, 'back');
  // water.fixedToCamera = true;
  // Add the platform layer as a static group, the player would be able
  // to jump on platforms like world collisions but they shouldn't move
  const platdec = map.createStaticLayer('SurfDecor', tileset, 0, -1500);
  const platforms = map.createStaticLayer('Surface', tileset, 0, -1500);

  platforms.setScale(2.1);
  platdec.setScale(2.1);

  // There are many ways to set collision between tiles and players
  // As we want players to collide with all of the platforms, we tell Phaser to
  // set collisions for every tile in our platform layer whose index isn't -1.
  // Tiled indices can only be >= 0, therefore we are colliding with all of
  // the platform layer
  platforms.setCollisionByExclusion(-1, true);

  // Add the player to the game world
  this.player = this.physics.add.sprite(80, 690, 'player');
  this.player.setScale(2.1);
  // this.player.setCollideWorldBounds(true); // don't go out of the map
  this.physics.add.collider(this.player, platforms);

  // Create the walking animation using the last 2 frames of
  // the atlas' first row
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'SWalk_',
      start: 1,
      end: 6,
    }),
    frameRate: 10,
    repeat: -1
  });

  // Create an idle animation i.e the first frame
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'SNeutral' }],
    frameRate: 10,
  });

  this.anims.create({
    key: 'look',
    frames: [{ key: 'player', frame: 'SLook' }],
    frameRate: 10,
  });

  // Use the second frame of the atlas for jumping
  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'SRoll_',
      start: 1,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'wfgo',
    frames: this.anims.generateFrameNumbers('waterfalltiles'),
    frameRate: 16,
    repeat: -1
  });

  this.anims.create({
    key: 'wgo',
    frames: this.anims.generateFrameNumbers('watertiles'),
    frameRate: 13,
  });


  this.waterfall.play('wfgo');
  this.water.play({key: 'wgo',repeat: -1});

  scoreText = this.add.text(0, 10, 'Score: 0', { fontSize: '40px', fill: '#e1dc26' }).setScrollFactor(0);

  // this.watf = this.add.group();
  // this.watf.createMultiple({ key: 'waterfallgo', repeat: 1});
  // this.watf.playAnimation('wfgo');

  // Enable user input via cursor keys
  this.cursors = this.input.keyboard.createCursorKeys();

  // Create a sprite group for all spikes, set common properties to ensure that
  // sprites in the group don't move via gravity or by player collisions
  this.rings = this.physics.add.group({
    allowGravity: false,
    immovable: true,
    key: 'coin',
    repeat: 11,
    setXY: { x: 150, y: 550, stepX: 40 },
    setScale: 2.5
  });

  // Get the spikes from the object layer of our Tiled map. Phaser has a
  // createFromObjects function to do so, but it creates sprites automatically
  // for us. We want to manipulate the sprites a bit before we use them
  // map.getObjectLayer('Collectibles').objects.forEach((coin) => {
  //   // Add new spikes to our sprite group
  //   const coinSprite = this.rings.create(coin.x + 200, coin.y - 400, 'coin');
  //   // By default the sprite has loads of whitespace from the base image, we
  //   // resize the sprite to reduce the amount of whitespace used by the sprite
  //   // so collisions can be more precise
  // });

  // Add collision between the player and the spikes
  this.physics.add.overlap(this.player, this.rings, ringget, null, this);

  this.cameras.main.setBounds(0, 0, 9600, 850);

  this.cameras.main.startFollow(this.player, true);
  this.cameras.main.setZoom(1);
}

function update() {
  // Control the player with left or right keys
  // const children = this.watf.getChildren();
  const cam = this.cameras.main;

  if (this.moveCam)
  {
    if (this.cursors.left.isDown)
    {
      cam.scrollX -= 4;
    }
    else if (this.cursors.right.isDown)
    {
      cam.scrollX += 4;
    }

    if (this.cursors.up.isDown)
    {
      cam.scrollY -= 4;
      this.water.y -= 4;
      this.cliffs.y -=4;
    }
    else if (this.cursors.down.isDown)
    {
      cam.scrollY += 4;
      this.water.y += 4;
      this.cliffs.y += 4;
    }
  }
  else {
    if (this.cursors.left.isDown && this.cursors.up.isUp) {
      this.player.setVelocityX(-200);
      if (this.player.body.onFloor()) {
        this.player.play('walk', true);
      }
    } else if (this.cursors.right.isDown && this.cursors.up.isUp) {
      this.player.setVelocityX(200);
      if (this.player.body.onFloor()) {
        this.player.play('walk', true);
      }
    } else {
      //   // If no keys are pressed, the player keeps still
      this.player.setVelocityX(0);
      // Only show the idle animation if the player is footed
      // If this is not included, the player would look idle while jumping
      if (this.player.body.onFloor()) {
        this.player.play('idle', true);
      }
    }
    //
    // // Player can jump while walking any direction by pressing the space bar
    // // or the 'UP' arrow
    if ((this.cursors.space.isDown) && this.player.body.onFloor()) {
      this.player.setVelocityY(-370);

      this.player.play('jump', true);
    }
    if (this.cursors.up.isDown && this.player.body.onFloor()){
      this.player.play('look', true);
    }
    //
    // // If the player is moving to the right, keep them facing forward
    if (this.player.body.velocity.x > 0) {
      this.player.setFlipX(false);
    } else if (this.player.body.velocity.x < 0) {
      // otherwise, make them face the other side
      this.player.setFlipX(true);
    }

  }
}

/**
 * playerHit resets the player's state when it dies from colliding with a spike
 * @param {*} player - player sprite
 * @param {*} spike - spike player collided with
 */
function ringget(player, ring) {
  ring.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);
}
