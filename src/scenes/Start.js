export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
        this.enemies = [];
        this.EnemyBullets = []; // Enemy bullet (un-used)

        this.bullets = [];
        this.bulletSpeed = 10;

        this.lastPlayerShot = 0;
        this.lastEnemyShot = 0;
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.image('player', 'assets/spaceship.png');
        this.load.image('enemy', 'assets/enemyShip.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.audio('explosion', 'assets/explosion-enemy.mp3')
        this.load.audio('sound-effect', 'assets/dark-empty-void.mp3') // sound-effect.mp3
    }

    // Phaser create()
    create() {        
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');
        this.explosionSound = this.sound.add('explosion'); // Expl sound
        // Background music 
        this.music = this.sound.add('sound-effect');
        this.music.play({
            loop: true,
            volume: 1 // 50% volume 
        });

        this.score = 0;
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00FF00',
        });
        
        // Create lives variable
        this.lives = 10;
        this.livesText = this.add.text(20, 60, `Lives: ${this.lives}`, {
            fontSize: '28px',
            fill: '#FF00FF',
        });


        this.createPlayer(); // Create player / spaceship
        this.createBullet(); // Bullet function
        // Keys
        this.keys = this.input.keyboard.createCursorKeys() // Event keys

        this.createEnemies(10); //  Create enemies 
    }

    // Phaser update()
    update() {
        // this.background.tilePositionY -= 2;
        this.updateEnemy();

        this.handleShooting();
        this.updateBullet();
        this.updatePlayer();

        this.collisionDetection(); // Detect collisions between enemy and bullet, enemy and player
    }

    // ---------- Create Player & update 
    createPlayer() {
        const { width, height } = this.scale;
        // Create variables for key presses
        this.rotateLeft = this.input.keyboard.addKey('A');
        this.rotateRight = this.input.keyboard.addKey('D');
        this.moveForward = this.input.keyboard.addKey('W');
        
        this.player = this.add.sprite(width * 0.5, height * 0.7, 'player'); // Player
        
        this.player.setOrigin(0.5, 0.5); // Center
    }

    updatePlayer() { // Updateplayer
        if(this.keys.up.isDown) this.background.tilePositionY -= 5;
        if(this.keys.left.isDown) this.background.tilePositionX -= 5;
        if(this.keys.down.isDown) this.background.tilePositionY += 5;
        if(this.keys.right.isDown) this.background.tilePositionX += 5;

        // Rotation A-W-D keys
        if(this.rotateLeft.isDown) this.player.rotation -= 0.05;
        if(this.rotateRight.isDown) this.player.rotation += 0.05;
        if(this.moveForward.isDown) this.background.tilePositionY -= 5;
    }

    // ------------------- Create bullets -------------------------
    createBullet() {
        const angle = this.player.rotation - Math.PI/2;
        const bulletX = Math.cos(angle) * this.bulletSpeed; // Speed
        const bulletY = Math.sin(angle) * this.bulletSpeed;

        const bullet = this.add.sprite(this.player.x + Math.cos(angle), this.player.y + Math.sin(angle), 'bullet') // Enemy


        bullet.direction = {
            x: bulletX,
            y: bulletY
        }

        bullet.setScale(0.15);
        this.bullets.push(bullet) // Push to the bullets array  
    }

    updateBullet() {
        this.bullets.forEach((bullet, index) => {
            bullet.x += bullet.direction.x;
            bullet.y += bullet.direction.y;
            bullet.rotation = this.player.rotation // Bullet rotation will be same as Player/Spaceship rotation
        })  
    }

    handleShooting() {
        if(this.keys.space.isDown && this.time.now > this.lastPlayerShot + 200) {
            this.createBullet();
            this.lastPlayerShot = this.time.now;
        }
    }

    // ----------- Enemies | Create enemies / update -------------------------
    createEnemies(count) {
        for (let i = 0; i < count; i++) {
            const enemy = this.add.sprite(
                Phaser.Math.Between(0, this.scale.width - 50),
                Phaser.Math.Between(0, -400), 
                'enemy'  
            );

            enemy.setOrigin(0.5, 0.5);
            enemy.setScale(0.5);

            enemy.speed = Phaser.Math.Between(1, 1.2);
            this.enemies.push(enemy);
        }
    }

    updateEnemy() {
        for(let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i]

            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);

            enemy.x += Math.cos(angle) * enemy.speed
            enemy.y += Math.sin(angle) * enemy.speed

            enemy.rotation = angle + Math.PI/2; // Rotation/face to the player

            if (enemy.y > this.scale.height + 50) {
                enemy.destroy(); 
                this.enemies.splice(i, 1);
            }
        }
    }
    // -------- Handle detections -------------------- 
    collisionDetection() {
        for(let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i]

            for(let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];

                if(Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 30) {
                    
                    this.explosionSound.play();

                    bullet.destroy()
                    this.bullets.splice(i, 1)

                    enemy.destroy();
                    this.enemies.splice(j, 1);

                    this.updateScoreText(1)
                    break;
                }

                if(Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 20) {
                    enemy.destroy();
                    this.enemies.splice(j, 1);


                    this.updatePlayerLives(1)

                    if(this.lives < 1) {
                        this.player.destroy()
                        this.player = null
                        this.gameOver()
                    }
                    break;
                }
            }
        }
    }
    updateScoreText(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }
    updatePlayerLives(lives) {
        this.lives -= lives;
        this.livesText.setText(`Lives: ${this.lives}`);
    }

    gameOver() {
        const gameOverText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2, 
            'GAME OVER', 
            {
                fontFamily: 'Arial',
                fontSize: '64px',
                color: '#FF0000',
            }
        );
        gameOverText.setOrigin(0.5);
        
        const restartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 100,
            'Click to Restart',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#FFFFFF'
            }
        );
        restartText.setOrigin(0.5);
        
        this.input.on('space', () => {
            this.scene.restart();
        });
    }

    // createEnemyBullet() { // Creating Enemy 
    //     this.enemies.forEach((enemy) => {
    //         const angle = enemy.rotation - Math.PI/2;
    //         const bulletX = Math.cos(angle) * 10
    //         const bulletY = Math.sin(angle) * 10
    
    //         const bullet = this.add.sprite(enemy.x + Math.cos(angle), enemy.y + Math.sin(angle), 'bullet') // Enemy
    
    //         bullet.direction = {
    //             x: bulletX,
    //             y: bulletY
    //         }
    //         bullet.setScale(0.15);
    //         bullet.setTint(0xff0000);
    //         this.EnemyBullets.push(bullet) // Push to the bullets array
    //     })
    // }

    // updateEnemyBullet() {
    //     this.EnemyBullets.forEach((bullet, index) => {
    //         this.enemies.forEach(enemy => {
    //             bullet.x += bullet.direction.x;
    //             bullet.y += bullet.direction.y;
    //             bullet.rotation = enemy.rotation
    //         })
    //     })  
    // }
    // handleEnemyShooting() {
    //     let i = 0
    //     if(i < 1 && this.time.now > this.lastEnemyShot + 1000) {
    //         this.createEnemyBullet();
    //         this.lastEnemyShot = this.time.now;
    //     }
    // }
}
