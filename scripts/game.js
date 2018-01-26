var game = new Phaser.Game(1000, 600, Phaser.CANVAS, 'phaser_Soldado', { preload:preload, create: create, update: update });

function preload(){
  game.load.spritesheet('pj', 'img/pj/SpriteSoldado.png',430,376);
  game.load.image('corazon', 'img/pj/corazon.png');
  game.load.image('bala', 'img/pj/bala.png');
  game.load.image('fondo', 'img/fondo.png');
  game.load.image('suelo', 'img/suelo.png');
  game.load.spritesheet('robotVolador', 'img/robotVolador.png', 32, 32);
  game.load.spritesheet('explota', 'img/explota.png', 128, 128);
  game.load.image('euro', 'img/euro.png');
}

var fondo;
//Parametros.
var pj;
var vidas;
var euros = 0;
var velocidad = 3;
var cantidadBalas = 3;
var recamara = 11;
var balas;
//Tiempos.
var tiempoAccion = 0;
var tiempoDisparo = 0;
var tiempoHerido = 0;
var tiempoCorazon = 0;
//Acciones.
var disparar;
var herrido;

var suelo;
var plataformas;
var isSuelo = false;

var robotsVoladores;
var tiempoRobotVolador = 0;
var explosiones;

var objetosCorazon;

var myeuros;

function create(){
  //Agrega la física a todo el proyecto.
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //Creamos el fondo.
  fondo = game.add.tileSprite(0, 0, game.world.width, 600, 'fondo');
  crearPlataforma();
  crearPJ();
  crearEuros();
  vidaSoldado();
  grupoBalas();
  grupoRobotVolador();
  grupoExplosionesRobotVolador();
  grupoObjetosCorazon();
}

function crearPJ(){
  // PJ or player
  pj = game.add.sprite(10, 200, 'pj');
  pj.scale.setTo(0.2, 0.2);
  game.physics.arcade.enable(pj);
  //pj.body.bounce.y = 0.3;
  pj.body.gravity.y = 200;
  pj.body.collideWorldBounds = true;
  pj.animations.add("correr",[21,22,23,24,25,26,27,28,29,30],10+(10 * velocidad), true);
  disparar = pj.animations.add("disparar",[32,33,34,35,36,37,38,39],60+(10 * velocidad), false);
  pj.animations.add("saltar",[0],3, true);
  herrido = pj.animations.add("herido",[10,11,10,12,10,13,10,14,10,15,10,16,10,17,10,18,10,19,10],30, false);
  pj.animations.add("morrir",[2,3,4,5,6,7,8],30, false);
  //Control del pj
  game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.SPACEBAR,
        Phaser.Keyboard.ENTER
    ]);
}

function crearPlataforma(){
  //Creamos la plataforma.
  plataformas = game.add.group();
  plataformas.enableBody = true;
  elSuelo = plataformas.create(0, game.world.height - 45, 'suelo');
  elSuelo.scale.setTo(10,0.5);
  elSuelo.body.immovable = true;
  suelo = game.add.tileSprite(0, game.world.height - 64, game.world.width, 64, 'suelo');
}

function crearEuros(){
  myeuros = game.add.text(50, 10, euros, { font: '34px Arial', fill: '#fff' });
  var simbolo = game.add.sprite(1,1,'euro');
  simbolo.scale.setTo(0.1, 0.1);
}

function grupoBalas(){
  balas = game.add.group();
    balas.enableBody = true;
    balas.physicsBodyType = Phaser.Physics.ARCADE;
    balas.createMultiple(recamara, 'bala');
    balas.setAll('anchor.x', 0.5);
    balas.setAll('anchor.y', 0.1);
    balas.setAll('outOfBoundsKill', true);
    balas.setAll('checkWorldBounds', true);
}

function grupoRobotVolador(){
  robotsVoladores = game.add.group();
    robotsVoladores.enableBody = true;
    robotsVoladores.physicsBodyType = Phaser.Physics.ARCADE;
    robotsVoladores.createMultiple(velocidad, 'robotVolador');
    robotsVoladores.setAll('anchor.x', 0.5);
    robotsVoladores.setAll('anchor.y', 1);
    robotsVoladores.setAll('outOfBoundsKill', true);
    robotsVoladores.setAll('checkWorldBounds', true);
}

function grupoObjetosCorazon(){
  objetosCorazon = game.add.group();
    objetosCorazon.enableBody = true;
    objetosCorazon.physicsBodyType = Phaser.Physics.ARCADE;
    objetosCorazon.createMultiple(1, 'corazon');
    objetosCorazon.scale.setTo(1.4, 0.5);
    objetosCorazon.setAll('anchor.x', 0.1);
    objetosCorazon.setAll('anchor.y', 1);
    objetosCorazon.setAll('outOfBoundsKill', true);
    objetosCorazon.setAll('checkWorldBounds', true);
}

function grupoExplosionesRobotVolador(){
  explosiones = game.add.group();
    explosiones.createMultiple(velocidad * 2, 'explota');
    explosiones.forEach(setupRobot, this);
}

function setupRobot (robot) {
        robot.anchor.x = 0.5;
        robot.anchor.y = 0.5;
        robot.animations.add('explota');

}

function vidaSoldado(){
  vidas = game.add.group();
  for (var i = 0; i < 3; i++)
          {
              var vida = vidas.create(game.world.width - ((30 * i) + 20), 30, 'corazon');
              vida.anchor.setTo(0.5, 0.5);
              vida.scale.setTo(0.2, 0.2);
              //vida.angle = 90;
              //vida.alpha = 0.4;
          }
}


function update(){
  // Fisicas.
  game.physics.arcade.collide(plataformas, pj, canJump);
  game.physics.arcade.overlap(balas, robotsVoladores, matarEnemigoRobotVolador, null, this);
  game.physics.arcade.overlap(pj, robotsVoladores, heridaSoldado, null, this);
  game.physics.arcade.overlap(pj, objetosCorazon, obtenerVida, null, this);
  //  Movimiento del fondo.
        fondo.tilePosition.x -= 1 * velocidad;
  // Movimiento del suelo.
        suelo.tilePosition.x -= 2 * velocidad;
  // Pj o personaje.
  controlPJ();
  // Crear enemigos.
  crearEnemigos();
  //Crear corazones.
  crearCorazones();
}

function obtenerVida(){
  console.log("VIDA");
  var cantidadVidas = vidas.countLiving();
  if(cantidadVidas > 3){
    var vida = vidas.create(game.world.width - ((30 * cantidadVidas) + 20), 30, 'corazon');
    vida.anchor.setTo(0.5, 0.5);
    vida.scale.setTo(0.2, 0.2);
  }
}

function controlPJ(){//downDuration
  //console.log("Disparo termina: "+disparar.isPlaying );
 if(vidas.countLiving() > 0){
   if(!disparar.isPlaying && !herrido.isPlaying  && game.time.now > tiempoAccion){
     if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
       Disparar();
       tiempoAccion = game.time.now + 100;
     } else if(!isSuelo){
       pj.animations.play("saltar");
       disparar.isFinished = false;
     } else{
       pj.animations.play("correr");
       disparar.isFinished = false;
     }
   }
    if(isSuelo){
     if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
       pj.body.velocity.y = -(game.world.height/2);
       isSuelo = false;
     }
   }
 }
 myeuros.text = euros;
}

function canJump(){
  isSuelo = true;
  //console.log("SALTA");
}

function matarEnemigoRobotVolador(bala, robotVolador){
  bala.kill();
  robotVolador.kill();
  var explosion = explosiones.getFirstExists(false);
    explosion.reset(robotVolador.body.x, robotVolador.body.y);
    explosion.play('explota', 50, false, true);
    euros += 5;
}

function heridaSoldado(pj, robotsVoladores){
  if (game.time.now > tiempoHerido)
  {
    vida = vidas.getFirstAlive();
    if (vida){
        vida.kill();
    }
    if(vidas.countLiving() < 1){
        pj.animations.play("morrir");
        velocidad = 0;
        tiempoHerido = game.time.now + 5000;
        pj.body.velocity.y = -150;
    }else{
        pj.animations.play("herido");
        tiempoHerido = game.time.now + 400;
    }
  }
}

function Disparar() {
  if(game.time.now > (tiempoAccion + 200)){
    pj.animations.play("disparar");
    bala = balas.getFirstExists(false);
    if (bala)
    {
      bala.anchor.setTo(0.5, 0.5);
      bala.scale.setTo(0.3, 0.3);
      bala.reset(pj.x + 80 , pj.y + 50);
      bala.body.velocity.x = +400;
    }
  }
}

function crearEnemigos(){
  CrearRobotVoladores();
}

function CrearRobotVoladores(){
  if (game.time.now > tiempoRobotVolador)
  {
      robot = robotsVoladores.getFirstExists(false);
      if (robot)
      {
        robot.reset(game.world.width + 100  , numeroRandom(pj.y + 50 , pj.y - 50));
        robot.body.velocity.x = -(100 * velocidad);
        tiempoRobotVolador = game.time.now + numeroRandom(600,100);
        robot.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        robot.play('fly');
      }
  }
}

function crearCorazones(){
  if (game.time.now > tiempoCorazon)
  {
      corazon = objetosCorazon.getFirstExists(false);
      if (corazon)
      {
        corazon.reset(game.world.width + 100  , 700/*numeroRandom(game.world.height - 50 , game.world.height - 100)*/);
        corazon.body.velocity.x = -(50 * velocidad);
        tiempoCorazon = game.time.now + numeroRandom(10000,5000);
      }
  }
}

function numeroRandom(max, min){
  var valor = Math.floor(Math.random() * (max - min + 1) ) + min;
  return valor;
}
