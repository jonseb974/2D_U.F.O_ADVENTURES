// LoadEvent: Fires when the pas has been loaded, include all
window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    //Drawing context
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if (((e.key === 'ArrowUp') ||
                     (e.key === 'ArrowDown')
                ) && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key); // shooting ammo if space is press
                } else if (e.key ===' '){
                    this.game.player.shootTop();
                } else if (e.key === 'd'){ //switch for debug mode letter d
                    this.game.debug = !this.game.debug;
                }
                //console.log(this.game.keys);
            });
            window.addEventListener('keyup', e =>{
                if (this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
                }
                //console.log(this.game.keys);
            });
        }

    } // setup projectiles
    class Projectile {
        constructor(game, x, y){ // use 2 arguments + game object for coordonates
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;  // width of the projectile in pixels
            this.height = 3; // height of the projectile in pixels
            this.speed = 3; // speed of the prjectile in pixels per frame
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
            // range of the laser 80% of the main game area
        }
        draw(context){ // shape of the laser beam
            context.fillStyle = 'yellow'; // represent the projectile
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    class Particle {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3); // 3 lines, on X axis.
            this.frameY = Math.floor(Math.random() * 3); // 3 columns, on Y axis.
            this.spriteSize = 50; // size of each frame in pixels
            this.sizeModifier = (Math.random() * 0.5 + 0.5) .toFixed(1); 
            this.size = this.spriteSize * this.sizeModifier; // random size of draw elements.
            this.speedX = Math.random() * 6 - 3; //horizontal speed of elements along X axis.
            this.speedY = Math.random() * -15; // vertical speed of elements along Y axis.
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;// velocity of angle
            // Bounce effect
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 100 + 60; //pixels

        }
        update(){
            this.angle += this.va;//increase velocity by va
            this.speedY += this.gravity; //increase by gravity
            this.x -= this.speedX + this.game.speed; // Horizontal coordonates of Each particles
            this.y += this.speedY; // vertical coordonates of each particles
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
            this.markedForDeletion = true;
        //Bounced effect
            if (this.y > this.game.height - this.bottomBounceBoundary && !this.
                bounced <2){ //else 1 if any performance issues
                this.bounced++;
                this.speedY *= -0.7;
            }
        }
        draw(context){
            context.save();// current canvas state
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize,
            this.frameY * this.spriteSize, this.spriteSize, this.spriteSize,
            this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();// reset canvas settings back to previous state
        }

    }  // PLAYER 
    class Player {
        constructor(game){
            this.game = game;
            // size of the player sprite
            this.width = 160;
            this.height = 190;
            // position of the player
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 11;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false; //super mode
            this.powerUpTimer = 0; //superMode duration
            this.powerUpLimit = 10000;//superMode maxduration
        }
        // PLAYER MOVEMENTS
        update(deltaTime){
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // Vertical boundaries of the player
            if  (this.y > this.game.height - this.height * 0.5)
                this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5; 

            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // sprite animation
            if (this.framX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }
            // powerUp
            if (this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1; //switch secondary animation
                    this.game.ammo += 0.1; // fast ammo reload
                }
            }

        }
        // draw graphics of the player with specifics canvas elements
        // example shape: a rectangle
        draw(context){
            //context.fillStyle = 'black';
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
            this.width, this.height, this.x, this.y, this.width, this.height);
            
        }
        // Player attack mode 
        shootTop(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 40));
                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 100));
                this.game.ammo--;
            }
        }
        enterPowerUp(){
            this.powerUpTimer = 0;//reset timer to have 10 second of super mode
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }
    // PARENT ENEMY CLASS
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0; // sprite horizontal navigation
            this.frameY = 0; // sprite vertical navigation
            this.maxFrame = 37;//37; // maximun number of image per sheet
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0; //reset frame to 0.
            }

        }
        draw(context){//context.fillStyle = 'black';//context.fillStyle = 'red';
            //context.fillRect(this.x, this.y, this.width, this.height);
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
            this.width, this.height, this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }
    class Angler1 extends Enemy { //Ship1
        constructor(game){
            super(game); // allows to use the constructor from class Enemy
            this.width = 228; // width of the enemy
            this.height = 169; // heigth of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // random creator
            this.image = document.getElementById('angler1'); //call enemy pics 
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class Angler2 extends Enemy { //Ship1
        constructor(game){
            super(game); // allows to use the constructor from class Enemy
            this.width = 213; // width of the enemy
            this.height = 165; // heigth of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // random creator
            this.image = document.getElementById('angler2'); //call enemy pics 
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class Lucky extends Enemy { //Ship1
        constructor(game){
            super(game); // allows to use the constructor from class Enemy
            this.width = 99; // width of the enemy
            this.height = 95; // heigth of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // random creator
            this.image = document.getElementById('lucky'); //call enemy pics 
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;// if destroy
            this.score = 15;//scrore points gain
            this.type = 'lucky';
        }
    }
    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;// 
            this.height = 500;
            this.x = 0;
            this.y = 0;        
        }
        update(){
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);//same image fill the gap 
        }

    }
    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());

        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    } //PARENT CLASS EXPLOSION
    class Explosion {
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0; // Start at this position
            this.spriteHeight = 200; //size of the spritesheetepixels
            this.spiteWidth = 200; //width of a single frame
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5; 
            this.y = y - this.height * 0.5;
            this.fps = 25; //speed frames per seconds
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.maxFrame = 8; // 8 frames by spritesheet
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth,
            0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width,
            this.height);
        }
    } // CLASS SMOKE EXPLOSION
    class SmokeExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('smokeExplosion');
        }

    }
    class FireEsplosion extends Explosion {

    }
    // Gamer interface
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 45;
            this.fontFamily = 'Rubik Iso';
            this.color = 'yellow';
        }
        draw(context){
            context.save(); // apply shadow on this items not to the entire page
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px' + this.fontFamily;
            // Display current Score
            context.fillText('Score: ' + this.game.score, 20, 40);
             // margin left 20px, space between 5*index
            //TIMER SETTING
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);
            // GAME OVER SETTINGS
            if (this.game.gameOver){
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore){
                    message1 = 'You Win !';
                    message2 = 'Well Done !';
                } else {
                    message1 = 'You lose !!!';
                    message2 = 'Try again, and fight !!!';
                }
                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }
            // ammonitions condition
            if (this.game.player.powerUp) context.fillStyle = '#ffffbd';
            for (let i = 0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.restore();
        }
    } //GAME CLASS CONTRUCTOR
    class Game {
        // contain canvas data, convert into class properties
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.explosions = [];
            this.enemyTimer = 0; // enemy generation begin of the game
            this.enemyInterval = 1000;// interval of enemy generation
            this.ammo = 20; // current level of ammo
            this.maxAmmo = 30; // maxlevel of ammo
            this.ammoTimer = 0;
            this.ammoInterval = 500;// time to reload
            this.gameOver = false;
            this.score = 0; //start score count
            this.winningScore = 525; // maxValue to reach
            this.gameTime = 0; // start time
            this.timeLimit = 60000;// time limit
            this.speed = 1;
            this.debug = false; // create a debug mode
        }
        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval){
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
                // PARTICLES setup
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle =>
            !particle.markedForDeletion);
                // EXPLOSIONS setup
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion =>
            !explosion.markedForDeletion);
                // COLLISIONS setup
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    this.addExplosion(enemy);// add explosion at enemy position
                    for (let i = 0; i < 10; i++){
                                this.particles.push(new Particle(this, enemy.x +
                                enemy.width * 0.5, enemy.y + enemy.height
                                * 0.5));
                    }
                    if (enemy.type === 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--; // Decrease enemy lives
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0){
                            for (let i = 0; i < 10; i++){
                                this.particles.push(new Particle(this, enemy.x +
                                enemy.width * 0.5, enemy.y + enemy.height
                                * 0.5));
                            } 
                            enemy.markedForDeletion = true;
                            this.addExplosion(enemy);
                            this.particles.push(new Particle(this, enemy.x +
                            enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                            if (!this.gameOver) this.score += enemy.score; // Increment score
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        } 
        draw(context){
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            this.particles.forEach(particle => particle.draw(context));
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.explosions.forEach(explosion => {
                explosion.draw(context);
            });
            this.background.layer4.draw(context);// draw layer4 on top of all others
        }
        addEnemy(){ // add enemy type
            const randomize = Math.random();// generate a random number between 0 & 1
            if (randomize < 0.3) this.enemies.push(new Angler1(this));// create angle1
            else if (randomize < 0.6) this.enemies.push(new Angler2(this)); //create angle2
            else this.enemies.push(new Lucky(this)); //create lucky
        }
         addExplosion(enemy){
            const randomize = Math.random();// generate a random number between 0 & 1
            if (randomize < 0.5) this.explosions.push(new SmokeExplosion
            (this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }
         // player === rect1, enemy === rect2
        checkCollision(rect1, rect2){ // true if collision detection, else false
            return(    rect1.x < rect2.x + rect2.width &&
                       rect1.x + rect1.width > rect2.x &&
                       rect1.y < rect2.y + rect2.height &&
                       rect1.height + rect1.y > rect2.y)
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // delete shape in between to have a fluid animation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0); //first timeStamp
});
