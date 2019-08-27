import * as p5 from "p5";
import "p5/lib/addons/p5.dom";
import * as ml5 from "ml5";
import io from "socket.io-client";

let video;
let features;
let knn;

let ready = false;
let label = 'nothing';
// let randomNumber;
let requiredArray;
let required;
let requiredUrl;
let requiredInstructionUrl;
let requiredInstructionImg;
let requiredImg;
let randomShapeForRound;
let circular;
let circularBold;
let qImg;
let bImg;
let cImg;
let eImg;
let hImg;
let iImg;
let kImg;
let lImg;
let oImg;
let rImg;
let tImg;
let zImg;
let foxInstrImg;
let trainListImages = [];
let isResultRequired;
let logo;
let finishedButton;

let checkShapeSuccessCounter;
let checkShapeFailCounter;


let trainingDetail;
let trainingDetailImg;

let yellow;
let yellowTransparent;
let red;
let redTransparent;
let black;
let gray;
let darkGray;
let lightGray;

let scene;
let score = 0;
let opponentScore = 0;

let randomNumberGenerated = false;
let trainButtonPressed= false;
let trainZoneButtonPressed = false;
let startGameButtonPressed = false;
let joinGameButtonPressed = false;
let finishButtonPressed = false;
let backButtonPressed = false;
let instructionsButtonPressed = false;
let playAgainButtonPressed = false;
let goToMenuButtonPressed = false;

// development
const socket = io('http://192.168.1.42:8081');

// production
// const socket = io('');

const shapes = [
  ["t-shirt", "t-shirt"],
  ["heart", "heart"],
  ["elephant", "elephant"],
  ["quick-fox", "quick fox"],
  //["unicorn", "unicorn"],
  ["ice-cream", "ice cream"],
  ["crab", "crab"],
  ["killer-whale", "killer whale"],
  ["bird", "bird"],
  ["rectangle", "rectangle"],
  //["walrus", "walrus"],
  //["ninja-star", "ninja star"],
  //["fish", "fish"],
  ["owl", "owl"],
  //["x", "x"],
  //["jiggly-worm", "jiggly worm"],
  //["mouse", "mouse"],
  //["penguin", "penguin"],
  //["snake", "snake"],
  //["v", "v"],
  ["lazy-dog", "lazy dog"],
  //["airplane", "airplane"],
  ["zen-triangle", "zen triangle"],
  //["yacht", "yacht"],
  //["dinosaur", "dinosaur"]
  //["other-fish", "other fish"],
  //["gentle-cactus", "gentle cactus"]
];

const trainingShapes = [
  ["t-shirt", "t-shirt"],
  ["heart", "heart"],
  ["elephant", "elephant"],
  ["quick-fox", "quick fox"],
  ["unicorn", "unicorn"],
  ["ice-cream", "ice cream"],
  ["crab", "crab"],
  ["killer-whale", "killer whale"],
  ["bird", "bird"],
  ["rectangle", "rectangle"],
  ["walrus", "walrus"],
  ["ninja-star", "ninja star"],
  ["fish", "fish"],
  ["owl", "owl"],
  ["x", "x"],
  ["jiggly-worm", "jiggly worm"],
  ["mouse", "mouse"],
  ["penguin", "penguin"],
  ["snake", "snake"],
  ["v", "v"],
  ["lazy-dog", "lazy dog"],
  ["airplane", "airplane"],
  ["zen-triangle", "zen triangle"],
  ["yacht", "yacht"]
];


let myId = "";
let targetId = false;

let isHost = false;
let isRoundDone = false;
let isCodeDeleted = false;
let isFieldDeleted = false;
let isShowInstructionsPressed = false;

const $input = document.createElement('input');
const $submit = document.createElement('input');
const $gameIntro = document.createElement('div');
const $code = document.createElement('div');
const $field = document.createElement('div');

$input.setAttribute('type', 'text');
$input.setAttribute('name', 'inputfield');
$submit.setAttribute('type', 'submit');
$submit.setAttribute('value', 'JOIN GAME');
const $body = document.querySelector('body');

const submitTargetId = () => {
  targetId = $input.value;
  socket.emit(`joinGame`, targetId, { myId: myId});
}

$submit.addEventListener("click", submitTargetId);

const modelReady = () => {
  console.log('model ready!');
  // Comment back in to load your own model!
  knn.load('./assets/datasets/model.json', console.log('knn loaded'));
}

const goClassify = () => {
  const logits = features.infer(video);
  knn.classify(logits, function(error, result) {
    if (error) {
      console.error(error);
    } else {
      label = result.label;
      console.log('Result: ' + result.label);
      goClassify();
    }
  });
}

const save = (knn, name) => {
  const dataset = knn.knnClassifier.getClassifierDataset();
  if (knn.mapStringToIndex.length > 0) {
    Object.keys(dataset).forEach(key => {
      if (knn.mapStringToIndex[key]) {
        dataset[key].label = knn.mapStringToIndex[key];
      }
    });
  }
  const tensors = Object.keys(dataset).map(key => {
    const t = dataset[key];
    if (t) {
      return t.dataSync();
    }
    return null;
  });
  let fileName = 'myKNN.json';
  if (name) {
    fileName = name.endsWith('.json') ? name : `${name}.json`;
  }
  saveFile(fileName, JSON.stringify({ dataset, tensors }));
};

const saveFile = (name, data) => {
  const downloadElt = document.createElement('a');
  const blob = new Blob([data], { type: 'octet/stream' });
  const url = URL.createObjectURL(blob);
  downloadElt.setAttribute('href', url);
  downloadElt.setAttribute('download', name);
  downloadElt.style.display = 'none';
  document.body.appendChild(downloadElt);
  downloadElt.click();
  document.body.removeChild(downloadElt);
  URL.revokeObjectURL(url);
};

const s = sk => {

  sk.preload = () => {
    //sk.createCanvas(window.innerWidth, window.innerHeight);

    const $p5Loading = document.getElementById('p5_loading');
    let $loadingImg = document.createElement('img');
    $loadingImg.setAttribute('src', 'assets/img/loader.gif');
    $loadingImg.setAttribute('alt', 'loading');
    $loadingImg.setAttribute('class', 'loadingimg');
    $loadingImg.setAttribute('width', '340');
    $loadingImg.setAttribute('height', '255');
    $p5Loading.innerHTML = "";
    $p5Loading.appendChild($loadingImg);
    console.log($p5Loading);

    circular = sk.loadFont('assets/font/C.otf');
    circularBold = sk.loadFont('assets/font/C_b.otf');
    qImg = sk.loadImage('assets/img/shapes/quick-fox.png');
    logo = sk.loadImage('assets/img/tqf-logo.png');
    foxInstrImg = sk.loadImage('assets/img/instructions/quick-fox-instructions.png');
    // bImg = sk.loadImage('assets/img/shapes/bird.png');
    // cImg = sk.loadImage('assets/img/shapes/crab.png');
    // eImg = sk.loadImage('assets/img/shapes/elephant.png');
    // hImg = sk.loadImage('assets/img/shapes/heart.png');
    // iImg = sk.loadImage('assets/img/shapes/ice-cream.png');
    // kImg = sk.loadImage('assets/img/shapes/killer-whale.png');
    lImg = sk.loadImage('assets/img/shapes/lazy-dog.png');
    // oImg = sk.loadImage('assets/img/shapes/owl.png');
    // rImg = sk.loadImage('assets/img/shapes/rectangle.png');
    // tImg = sk.loadImage('assets/img/shapes/t-shirt.png');
    // zImg = sk.loadImage('assets/img/shapes/zen-triangle.png');
  }

  sk.setup = () => {
      sk.createCanvas(window.innerWidth, window.innerHeight);

      yellow = sk.color(252, 238, 33);
      red = sk.color(255, 28, 0);
      yellowTransparent = sk.color(252, 238, 33, .8);
      redTransparent = sk.color(255, 28, 0, .8);
      black = '#332B33';
      gray = '#494049';
      darkGray = '#3F363F';
      lightGray = '#706E70';

      //scene = "shapegive";

      //set lines in comment to get a random shape
      // requiredArray = shapes[3];
      // required = requiredArray[1];
      // requiredUrl = 'assets/img/shapes/' + requiredArray[0] + '.png';

      //scene = "gamemenu";
      gameMenuSetup();
      features = ml5.featureExtractor('MobileNet', modelReady);
      knn = ml5.KNNClassifier();

  };

  const gameMenuSetup = () => {
    $gameIntro.innerHTML = "A Firefox multiplayer <span>mobile</span> game controlled by your <span>camera</span> and your abilities to make <span>origami</span>. Grab a friend, some <span>white square paper</span>, and a pen (a non white surface is also recommended). The first player with 26 points is crowned the title of <span>the quick fox</span>."
    $gameIntro.setAttribute('class', 'gameintro');
    $body.appendChild($gameIntro);
    scene = "gamemenu";
  }

  const gameMenu = () => {

    sk.resizeCanvas(window.innerWidth, window.innerHeight);

    scene = "gamemenu";

    sk.clear();
    sk.background(black);

    sk.imageMode(sk.CENTER);

    sk.image(logo, sk.width / 2, sk.height / 4, sk.width * 0.8, sk.width * 0.08);
    sk.image(qImg, sk.width / 2, sk.height / 8, sk.width * 0.35, sk.width * 0.35);

    sk.textAlign(sk.CENTER);
    sk.textFont(circular);

    //trainzonebutton
    if (!trainZoneButtonPressed) {
      sk.fill('#ffffff');
    } else {
      sk.fill((yellow));
      setTimeout(trainZoneButtonPressed = false, 5000);
    }
    sk.textFont(circularBold);
    //sk.fill('#ffffff');
    sk.stroke(black);
    sk.rectMode(sk.CENTER);
    sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
    sk.fill(black);
    sk.stroke(black);
    sk.noStroke();
    sk.triangle(
      sk.width*0.95, sk.height - (sk.height / 16) - 30,
      sk.width*0.95 - 30, sk.height - (sk.height / 16) - 30,
      sk.width*0.95, sk.height - (sk.height / 16)
    );
    sk.fill(yellow);
    sk.noStroke();
    sk.triangle(
      sk.width*0.95 - 30, sk.height - (sk.height / 16),
      sk.width*0.95 - 30, sk.height - (sk.height / 16) - 30,
      sk.width*0.95, sk.height - (sk.height / 16)
    );


    let buttonText = 'TRAIN THE QUICK FOX';
    sk.fill(0);
    sk.textSize(20);
    sk.text(buttonText, sk.width / 2, sk.height - (sk.height / 16) + 7);

    //join button

    if(!joinGameButtonPressed) {
      startGameButtonPressed = false;
      sk.fill(255);
    } else {
      startGameButtonPressed = false;
      sk.fill(yellow);
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
    sk.fill(0);
    //console.log(myId);
    sk.text('JOIN GAME', sk.width / 2, sk.height - (sk.height / 16) - 78);

    //start button
    //sk.fill(yellow);
    if (!startGameButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill((255));
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 170, sk.width * 0.9, 60);
    sk.fill(0)
    sk.text('START GAME', sk.width / 2, sk.height - (sk.height / 16) - 163)

  }

  const gameOver = () => {

    sk.resizeCanvas(window.innerWidth, window.innerHeight);

    scene = "gameover";

    sk.clear();
    sk.background(black);

    sk.imageMode(sk.CENTER);

    if (score > opponentScore) {
      sk.image(qImg, sk.width / 2, sk.height * 0.52, sk.width * 0.5, sk.width * 0.5);
      sk.fill(yellow);
      sk.textSize(40);
      sk.text('Congrats!', sk.width / 2, sk.height / 4);
      sk.fill(255);
      sk.textSize(20);
      sk.text("You're the quick fox",  sk.width / 2, sk.height / 3.2);
    } else {
      sk.image(lImg, sk.width / 2, sk.height * 0.52, sk.width * 0.5, sk.width * 0.5);
      sk.fill(yellow);
      sk.textSize(40);
      sk.text('Too bad...', sk.width / 2, sk.height / 4);
      sk.fill(255);
      sk.textSize(23);
      sk.text("You're the lazy dog",  sk.width / 2, sk.height / 3.2);
    }
    sk.textAlign(sk.CENTER);
    sk.textFont(circular);


    sk.rectMode(sk.CENTER);
    sk.textFont(circularBold);

    //go to menu button
    if(!goToMenuButtonPressed) {
      startGameButtonPressed = false;
      sk.fill(255);
    } else {
      startGameButtonPressed = false;
      sk.fill(yellow);
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
    sk.fill(0);
    //console.log(myId);
    sk.text('GO TO MENU', sk.width / 2, sk.height - (sk.height / 16) + 7);

    //play again button
    if (isHost) {
      if (!playAgainButtonPressed) {
        sk.fill(yellow);
      } else {
        sk.fill((255));
      }
      sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
      sk.fill(0)
      sk.text('PLAY AGAIN', sk.width / 2, sk.height - (sk.height / 16) - 78);
    }

    sk.noStroke();
    showScores();

  }

  sk.windowResized = () => {
    //console.log("resized");
    //sk.resizeCanvas(window.innerWidth, window.innerHeight);
    //trainingZone();
  }

  const trainingZone = () => {
    scene = "trainingzone";
    sk.resizeCanvas(window.innerWidth, window.innerHeight * 2);
    sk.clear();
    sk.background(black);

    // header

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.imageMode(sk.CENTER);
    // 1/4th of innerHeight
    //sk.loadImage(logo, img => {sk.image(img, sk.width / 2, sk.height / 6, sk.width * 0.8, sk.width * 0.08)});
    sk.image(logo, sk.width / 2, sk.height / 8, sk.width * 0.8, sk.width * 0.08)
    // 1/8th of innerHeight
    sk.image(qImg, sk.width / 2, sk.height / 16, sk.width * 0.35, sk.width * 0.35)

    sk.textAlign(sk.CENTER);
    sk.textFont(circularBold);
    sk.textSize(25);
    sk.fill(yellow);
    // 0.3105 of innerHeight
    sk.text('TRAINING ZONE', sk.width / 2, sk.height * 0.1653);

    backButton();

    //show all shapes
    for (var i = 0; i < trainingShapes.length; i++) {
      trainListImages[i] = 'assets/img/shapes/' + trainingShapes[i][0] + '.png';

      console.log(trainListImages);
      sk.fill(gray);
      sk.noStroke();
      sk.rectMode(sk.CENTER);

      let remainder = i%3;
      let divided = i / 3;
      let shapeSize = sk.width / 4;
      let border = sk.width / 24;
      let xPos = sk.width * (1/5 + (1.5/5 * remainder));
      let yPos = (sk.height * 0.23) + ((shapeSize + border) * Math.floor(divided));

      let trainShape = sk.rect(xPos, yPos, shapeSize, shapeSize);
      let trainImage = sk.loadImage(trainListImages[i], img => {sk.image(img, xPos, yPos, shapeSize, shapeSize)});
    }
  }

  const backButton = () => {
    //back button
    sk.textSize(25);
    sk.textFont(circularBold);
    if (!backButtonPressed) {
      sk.fill('#ffffff');
    } else {
      sk.fill(yellow);
    }
    sk.rectMode(sk.CORNER);
    sk.rect(0, 40, 90, 60);
    sk.fill(black);
    sk.triangle(90,40, 90,60, 70,40);
    sk.fill(yellow);
    sk.triangle(70,60, 90,60, 70,40);
    sk.fill(0);
    sk.text('Back', 42, 80);
  }

  const trainingZoneDetail = (detail) => {

    sk.resizeCanvas(window.innerWidth, window.innerHeight);

    trainingDetail = detail;
    trainingDetailImg = sk.loadImage('assets/img/shapes/' + shapes[trainingDetail][0] + '.png');

    //video = sk.createCapture(sk.VIDEO);
    video = sk.createCapture({
      audio: false,
      video: {
        facingMode: "environment"
      }
    });
    video.size(sk.width,sk.height);
    video.style("transform", "scale(-1,1)");
    video.hide();

    scene = "trainingzonedetail";

  }

  const drawTrainingZoneDetail = () => {

    sk.clear();
    sk.background(black);

    sk.imageMode(sk.CORNER);
    sk.image(video, 0, 0, sk.width, sk.height);

    sk.imageMode(sk.CENTER);
    sk.image(trainingDetailImg, sk.width / 2, sk.height / 8, sk.width * 0.35, sk.width * 0.35);

    let headerText = 'THE ' + shapes[trainingDetail][1].toUpperCase();

    sk.textAlign(sk.CENTER);
    sk.textFont(circularBold);


    sk.textSize(35);
    sk.fill('#ffffff');
    sk.text(headerText, sk.width / 2, sk.height / 3.8);

    sk.textSize(25);
    sk.fill(yellow);
    // 0.3105 of innerHeight
    sk.text('TRAINING ZONE', sk.width / 2, sk.height * 0.3105);

    //back button
    if (!backButtonPressed) {
      sk.fill('#ffffff');
    } else {
      sk.fill(yellow);
    }
    sk.rectMode(sk.CORNER);
    sk.rect(0, 40, 90, 60);
    sk.fill(black);
    sk.triangle(90,40, 90,60, 70,40);
    sk.fill(yellow);
    sk.triangle(70,60, 90,60, 70,40);
    sk.fill(0);
    sk.text('Back', 42, 80);

    //backButton();

    //trainbutton
    if (!trainButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill(('#ffffff'));
      setTimeout(trainButtonPressed = false, 200);
    }
    sk.rectMode(sk.CENTER);
    sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);

    let buttonText = 'TRAIN YOUR ' + shapes[trainingDetail][1].toUpperCase();
    sk.fill(0);
    sk.textSize(20);
    sk.text(buttonText, sk.width / 2, sk.height - (sk.height / 16) + 5);


    if (!ready && knn.getNumLabels() > 0) {
      goClassify();
      ready = true;
    }

  }

  const joinGameSetup = () => {
    $field.setAttribute('class', 'field');
    $submit.setAttribute('class', 'submit');
    //$field.setAttribute('width', window.innerWidth * 0.9);
    // $code.innerHTML = myId;
    // $body.appendChild($code);
    $input.setAttribute('class', 'textfield');
    $input.setAttribute('placeholder', 'CODE');

    $field.appendChild($input);
    $field.appendChild($submit);
    $body.appendChild($field);
    //$body.appendChild($submit);

    //console.log(myId);
    scene = "joingame";
  }

  const joinGame = () => {
    sk.clear();
    sk.background(black);

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.imageMode(sk.CENTER);
    // 1/4th of innerHeight
    //sk.loadImage(logo, img => {sk.image(img, sk.width / 2, sk.height / 6, sk.width * 0.8, sk.width * 0.08)});
    sk.image(logo, sk.width / 2, sk.height / 4, sk.width * 0.8, sk.width * 0.08)
    // 1/8th of innerHeight
    sk.image(qImg, sk.width / 2, sk.height / 8, sk.width * 0.35, sk.width * 0.35)

    sk.textAlign(sk.CENTER);
    sk.textFont(circularBold);
    sk.textSize(25);
    sk.fill(yellow);
    // 0.3105 of innerHeight
    sk.text('JOIN GAME', sk.width / 2, sk.height * 0.33);

    sk.textFont(circular);
    sk.textSize(16);
    sk.fill(255);
    sk.text('Type the code your opponent has shared', sk.width / 2, sk.height * 0.54 - 50);

    backButton();
  }

  const startGameSetup = () => {
    $code.setAttribute('class', 'code');
    $code.setAttribute('width', window.innerWidth * 0.9);
    $code.innerHTML = myId;
    $body.appendChild($code);
    console.log(myId);
    scene = "startgame";
  }

  const startGame = () => {
    sk.clear();
    sk.background(black);

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.imageMode(sk.CENTER);
    // 1/4th of innerHeight
    //sk.loadImage(logo, img => {sk.image(img, sk.width / 2, sk.height / 6, sk.width * 0.8, sk.width * 0.08)});
    sk.image(logo, sk.width / 2, sk.height / 4, sk.width * 0.8, sk.width * 0.08)
    // 1/8th of innerHeight
    sk.image(qImg, sk.width / 2, sk.height / 8, sk.width * 0.35, sk.width * 0.35)

    sk.textAlign(sk.CENTER);
    sk.textFont(circularBold);
    sk.textSize(25);
    sk.fill(yellow);
    // 0.3105 of innerHeight
    sk.text('START GAME', sk.width / 2, sk.height * 0.33);

    sk.textFont(circular);
    sk.textSize(16);
    sk.fill(255);
    sk.text('Share this code with your opponent', sk.width / 2, sk.height * 0.54 + 60);
    sk.fill(255);
    sk.rectMode(sk.CENTER);
    sk.rect(sk.width / 2, sk.height * 0.54, sk.width * 0.9, 60);

    backButton();
  }

  socket.on(`connectionUrl`, socketId => {
    console.log("connection made");
    console.log("socketid: " + socketId);
    myId = socketId;

  })

  socket.on(`startGame`, id => {
    console.log("startGame id: " + id);
    if (!targetId) {
      targetId = id;
    }
    //document.write(myId + " " + targetId);
    console.log(myId + " " + targetId);
    newRound();
  })

  socket.on(`newRound`, (index) => {
    console.log(index);
    shapeGiveSetup(index);
  })

  socket.on(`updateScore`, (otherScore) => {
    // if (isShowInstructionsPressed) {
    //   opponentScore = otherScore;
    //   isShowInstructionsPressed = false;
    // }
    opponentScore = otherScore;
    isShowInstructionsPressed = false;
  })

  socket.on(`resetScore`, (otherScore) => {
    score = otherScore;
    opponentScore = otherScore;
  })

  socket.on(`roundDone`, isWinner => {
    addScore(isWinner);
  });

  socket.on(`disconnect`, () => {
    console.log("disconnected");
  })

  const addScore = isWinner => {
    isRoundDone = true;
    console.log('winner' + isWinner);
    if (isWinner) {
      score = score + 5;
    } else {
      opponentScore = opponentScore + 5;
    }
    newRound();
  };

  const checkForGameover = () => {
    let maxScore = 26;

    if (score >= maxScore || opponentScore >= maxScore){
      gameOver();
    }
  };

  const generateNumberForShape = () => Math.floor(Math.random() * shapes.length);

  const newRound = () => {
    console.log(playAgainButtonPressed);
    if (playAgainButtonPressed) {
      score = 0;
      opponentScore = 0;
      console.log(score + " " + opponentScore);
      socket.emit(`resetScore`, score, targetId);
      playAgainButtonPressed = false;
    }
    if (isHost) {
      isRoundDone = false;
      const index = generateNumberForShape();
      //console.log(index);
      shapeGiveSetup(index);
      console.log("newRound");
      socket.emit(`newRound`, index, targetId);
    }
  }

  const shapeGiveSetup = (number) => {
    if (isHost && !isCodeDeleted) {
      $body.removeChild($code);
      isCodeDeleted = true;
    } else if (!isHost && !isFieldDeleted) {
      $body.removeChild($field);
      isFieldDeleted = true;
    }
    console.log(number);
    randomShapeForRound = shapes[number];
    requiredArray = randomShapeForRound;
    required = requiredArray[1];
    requiredUrl = 'assets/img/shapes/' + requiredArray[0] + '.png';
    requiredImg =  sk.loadImage(requiredUrl);
    requiredInstructionUrl = 'assets/img/instructions/' + requiredArray[0] + '-instructions.png';
    requiredInstructionImg =  sk.loadImage(requiredInstructionUrl);

    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;

    scene = "shapegive";

    console.log(score);

  }

  const showScores = () => {
    sk.translate(sk.width - sk.width, sk.height - sk.height);
    // your score
    sk.fill(darkGray);
    sk.rectMode(sk.CORNER);
    sk.rect(0, 0, sk.width / 2, 65);

    // opponent score
    sk.fill(gray);
    sk.rect(sk.width / 2, 0, sk.width / 2, 65);

    //if your score > opponent score = your score fill yellow, else fill white
    //if your score = opponent score => both fill white
    sk.fill(255);
    sk.textFont(circular);

    sk.textSize(12);
    sk.text('you', sk.width / 4, 19);

    sk.fill(255);
    sk.text('opponent', sk.width * 0.75, 19);

    sk.textFont(circularBold);
    sk.textSize(29);

    // your score
    sk.fill(255);
    sk.text(score, sk.width / 4, 45);

    // opponent score
    sk.fill(255);
    sk.text(opponentScore, sk.width * 0.75, 45);
  }

  const shapeGive = () => {

    //layout
    sk.clear();
    sk.background(black);
    showScores();

    sk.rectMode(sk.CENTER);
    sk.translate(sk.width - sk.width, sk.height - sk.height);
    sk.imageMode(sk.CENTER);

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.image(requiredImg, sk.width / 2, sk.height / 3 + 22, sk.width * 0.65, sk.width * 0.65);

    sk.textFont(circularBold);
    sk.textSize(30);
    sk.textAlign(sk.CENTER);
    sk.fill('#ffffff');

    //"make a" vs. "make an"
    if (required.charAt(0) === "a" ||required.charAt(0) === "e" ||required.charAt(0) === "i" ||required.charAt(0) === "o" ||required.charAt(0) === "u" ||required.charAt(0) === "x") {
      sk.text('Make an ' + required, sk.width / 2, sk.height / 2 + 70);
    } else {
      sk.text('Make a ' + required, sk.width / 2, sk.height / 2 + 70);
    }

    //finish button
    sk.textSize(20);
    if (!finishButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill((255));
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
    sk.fill(0)
    sk.text("I'M FINISHED", sk.width / 2, sk.height - (sk.height / 16) - 78);

    //instructions button
    sk.rectMode(sk.CENTER);
    sk.textFont(circularBold);
    sk.noStroke();
    if (score < 2) {
      sk.fill(gray);
      sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
      sk.fill(black);
      sk.triangle(sk.width,sk.height - (sk.height / 16) - 35, sk.width,sk.height - (sk.height / 16) + 60, sk.width * 0.8,sk.height - (sk.height / 16) - 35);
      sk.fill(darkGray);
      sk.triangle(sk.width * 0.97, sk.height - (sk.height / 16) - 30, sk.width * 0.873, sk.height - (sk.height / 16), sk.width * 0.8,sk.height - (sk.height / 16) - 30);

      sk.fill(255);
      sk.text("SHOW INSTRUCTIONS", sk.width / 2, sk.height - (sk.height / 16) + 7);
      sk.textSize(15);
      sk.text("- 2", sk.width * 0.88, sk.height - (sk.height / 16) - 15);
    } else {
      if (!instructionsButtonPressed) {
        sk.fill(255);
        sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
        sk.fill(black);
        sk.triangle(sk.width,sk.height - (sk.height / 16) - 35, sk.width,sk.height - (sk.height / 16) + 60, sk.width * 0.8,sk.height - (sk.height / 16) - 35);
        sk.fill(yellow);
        sk.triangle(sk.width * 0.97, sk.height - (sk.height / 16) - 30, sk.width * 0.873, sk.height - (sk.height / 16), sk.width * 0.8,sk.height - (sk.height / 16) - 30);
      } else {
        sk.fill(yellow);
        sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
        sk.fill(black);
        sk.triangle(sk.width,sk.height - (sk.height / 16) - 35, sk.width,sk.height - (sk.height / 16) + 60, sk.width * 0.8,sk.height - (sk.height / 16) - 35);
        sk.fill(255);
        sk.triangle(sk.width * 0.97, sk.height - (sk.height / 16) - 30, sk.width * 0.873, sk.height - (sk.height / 16), sk.width * 0.8,sk.height - (sk.height / 16) - 30);
      }
      sk.fill(0);
      sk.text("SHOW INSTRUCTIONS", sk.width / 2, sk.height - (sk.height / 16) + 7);
      sk.textSize(15);
      sk.text("- 2", sk.width * 0.88, sk.height - (sk.height / 16) - 15);
    }


  };

  const shapeGiveInstructionsSetup = () => {
    score = score - 2;
    if (!isShowInstructionsPressed) {
      isShowInstructionsPressed = true;
      socket.emit(`updateScore`, score, targetId);
    }
    scene = "shapegiveinstructions";
  }

  const shapeGiveInstructions = () => {

    scene = "shapegiveinstructions";
    //layout
    sk.clear();
    sk.background(black);
    sk.noStroke();
    showScores();

    sk.rectMode(sk.CENTER);
    sk.translate(sk.width - sk.width, sk.height - sk.height);
    sk.imageMode(sk.CENTER);

    sk.image(requiredInstructionImg, sk.width / 2, sk.height * 0.5, sk.width * 0.9, sk.width * 0.9 * 1242 / 1337);

    sk.textFont(circularBold);
    sk.textSize(30);
    sk.textAlign(sk.CENTER);
    sk.fill('#ffffff');

    sk.text('Instructions', sk.width / 2, sk.height * 0.2);

    //finish button
    sk.textSize(20);
    if (!finishButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill((255));
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 55, sk.width * 0.9, 60);
    sk.fill(0)
    sk.text("I'M FINISHED", sk.width / 2, sk.height - (sk.height / 16) - 48);

  };

  const shapeCheckSetUp = () => {

    scene = "shapecheck";

    sk.clear();
    sk.fill(black);

    video = sk.createCapture({
      audio: false,
      video: {
        facingMode: "environment"
      }
    });
    //video = sk.createCapture(sk.VIDEO);
    video.size(sk.width,sk.height*0.6);
    video.style("transform", "scale(-1,1)");
    video.elt.setAttribute('playsinline', '');
    video.hide();
    console.log(video);
  };

  const shapeCheck = () => {
    sk.clear();
    //sk.background(black);

    sk.translate(0, 0);

    sk.imageMode(sk.CORNER);
    sk.image(video, 0, 60);

    showScores();

    sk.imageMode(sk.CENTER);

    sk.image(requiredImg, sk.width / 2, sk.height * 0.72, sk.width * 0.4, sk.width * 0.4);

    sk.translate(sk.width / 2, sk.height / 2);
    sk.textFont(circularBold);
    sk.textSize(30);
    sk.textAlign(sk.CENTER);
    sk.fill('#ffffff');
    sk.text('Show your ' + required, 0, sk.height / 2 - sk.height / 8);

    //sk.translate(0, 0);

    if (!ready && knn.getNumLabels() > 0) {
      goClassify();
      ready = true;
    }
    if (knn.getNumLabels() > 0) {
      if (label === "empty") {
        console.log("try to aim your camera to your origami creation");
      } else {
        if (label === required) {
          checkShapeSuccessCounter++;
          console.log(checkShapeSuccessCounter);
          if (checkShapeSuccessCounter > 15) {
            sk.background(yellow);
            sk.translate(- sk.width / 2, - sk.height / 2);

            sk.fill(yellow);
            sk.rectMode(sk.CORNER);
            sk.rect(0,60, sk.width, sk.height - 60);
            sk.textSize(100);
            sk.fill('#ffffff');
            sk.text('+ 5', sk.width / 2, sk.height / 2 + 30);
            checkShapeFailCounter = 0;
          }
          if (checkShapeSuccessCounter > 20) {
            shapeSuccess();
          }
        } else {
          checkShapeFailCounter++;
          if (checkShapeFailCounter > 40 ) {
            sk.clear();
            sk.background(red);
            sk.translate(- sk.width / 2, - sk.height / 2);

            sk.fill(red);
            sk.rectMode(sk.CORNER);
            sk.rect(0,60, sk.width, sk.height - 60);
            sk.textSize(30);
            sk.fill('#ffffff');
            sk.text('Not quite right', sk.width / 2, sk.height / 2 + 30);

            showScores();
          }
          if (checkShapeFailCounter > 43 ) {
            shapeFail();
          }
        }
      }
    }
  }

  const shapeSuccess = () => {
    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;
    scene = "shapesuccess";

    console.log("score: " + score);

    if (!isRoundDone) {
      isRoundDone = true;

      socket.emit(`roundDone`, {
        winner: myId,
        loser: targetId
      });

      addScore(true);
    }

    //showScores();
  }

  const shapeFail = () => {
    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;
    scene = "shapefail";
    console.log("score: " + score);

    setTimeout(shapeGive, 1500);
  }

  sk.keyPressed = () => {
    if (scene === "shapecheck" && knn.getNumLabels() > 0) {
      const logits = features.infer(video);
      if (sk.key == 'e') {
        knn.addExample(logits, 'empty');
        console.log('empty');
      } else if (sk.key == 's') {
        save(knn, 'model.json');
        //knn.save('model.json');
      }
    }
    if (scene === "trainingzonedetail" && knn.getNumLabels() > 0) {
      if (sk.key == 's') {
        save(knn, 'model.json');
      }
    }
  }

  sk.touchEnded = () => {

    if (scene === "gameover") {
      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 &&
        sk.mouseY < sk.height - (sk.height / 16) - 85 + 30){
        playAgainButtonPressed = true;
        console.log(playAgainButtonPressed);
        // score = 0;
        // opponentScore = 0;
        setTimeout(newRound, 1000);
      }

      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        goToMenuButtonPressed = false;
        socket.emit(`disconnect`);
        setTimeout(gameMenu, 200);
      }

    }

    if (scene === "gamemenu") {
      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > (sk.height - (sk.height / 16) - 30) &&
        sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        $body.removeChild($gameIntro);
        setTimeout(trainingZone(), 1000);
        trainZoneButtonPressed = false;
      }

      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 200 &&
        sk.mouseY < sk.height - (sk.height / 16) - 140 ){
        startGameButtonPressed = false;
        //shapeGiveSetup();
        $body.removeChild($gameIntro);
        startGameSetup();
        isHost = true;
        console.log("i am host");
        //scene = "startgame";
      }

      //sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 &&
        sk.mouseY < sk.height - (sk.height / 16) - 85 + 30){
        joinGameButtonPressed = false;
        console.log("join");
        $body.removeChild($gameIntro);
        joinGameSetup();
      }
    }

    if (scene === "shapegiveinstructions") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 55 - 30 && sk.mouseY < sk.height - (sk.height / 16) - 55 + 30 ){
        finishButtonPressed = false;
        shapeCheckSetUp();
      }
    }

    if (scene === "shapegive") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 && sk.mouseY < sk.height - (sk.height / 16) - 85 + 30 ){
        finishButtonPressed = false;
        shapeCheckSetUp();
      }

      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > (sk.height - (sk.height / 16) - 30) &&
        sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        if (score > 2 || score == 2) {
          instructionsButtonPressed = false;
          shapeGiveInstructionsSetup();
        }
      }
    }

    if (scene === "trainingzonedetail") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        trainingZone();
        backButtonPressed = false;
        //stop video capture
      }

      if (sk.mouseX > 100 && sk.mouseX < sk.width && sk.mouseY > 0 && sk.mouseY < sk.height * (1/3) ) {
        save(knn, 'model.json');
      }
    }

    if (scene === "trainingzone") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        gameMenuSetup();
        backButtonPressed = false;
      }
    }

    if (scene === "startgame") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        gameMenuSetup();
        backButtonPressed = false;
        $body.removeChild($code);
        //host is false
        isHost = false;
      }
    }

    if (scene === "joingame") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        gameMenuSetup();
        backButtonPressed = false;
        $body.removeChild($field);
      }
    }

  }


  sk.touchStarted = () => {

    if (scene === "gameover") {

      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 &&
        sk.mouseY < sk.height - (sk.height / 16) - 85 + 30){
          playAgainButtonPressed = true;
          console.log(playAgainButtonPressed);
      }

      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        goToMenuButtonPressed = true;
      }

    }

    if (scene === "gamemenu") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        trainZoneButtonPressed = true;
      }

      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 200 && sk.height - (sk.height / 16) - 140 ){
        startGameButtonPressed = true;
      }

      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 &&
        sk.mouseY < sk.height - (sk.height / 16) - 85 + 30){
        joinGameButtonPressed = true;
      }

    }

    if (scene === "shapegiveinstructions") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 55 - 30 && sk.mouseY < sk.height - (sk.height / 16) - 55 + 30 ){
        finishButtonPressed = true;
      }
    }

    //sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
    if (scene === "shapegive") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 85 - 30 && sk.mouseY < sk.height - (sk.height / 16) - 85 + 30 ){
        finishButtonPressed = true;
        //shapeCheckSetUp();
      }

      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        if (score > 2 || score == 2) {
          instructionsButtonPressed = true;
        }
      }

    }

    if (scene === "trainingzonedetail" || scene === "startgame" || scene === "joingame") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        backButtonPressed = true;
      }
    }

    if (scene === "trainingzone") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        //gameMenu();
        backButtonPressed = true;
      }
    }

    if (scene === "trainingzonedetail") {
      const logits = features.infer(video);
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        console.log("train");
        trainButtonPressed= true;
        knn.addExample(logits, shapes[trainingDetail][1]);
        //save(knn, 'model.json');
      }
    }

    if (scene === "trainingzone") {
      for (var i = 0; i < shapes.length; i++) {

        let remainder = i%3;
        let divided = i / 3;
        let shapeSize = sk.width / 4;
        let border = sk.width / 24;
        let xPos = sk.width * (1/5 + (1.5/5 * remainder));
        let yPos = (sk.height * 0.23) + ((shapeSize + border) * Math.floor(divided));

        //check if mouseposition is on shape
        if (
          sk.mouseX > (xPos - (shapeSize / 2)) &&
          sk.mouseX < (xPos + (shapeSize / 2)) &&
          sk.mouseY > (yPos - (shapeSize / 2)) &&
          sk.mouseY < (yPos + (shapeSize / 2))
        ) {
            // style
            // let trainShape = sk.rect(xPos, yPos, shapeSize, shapeSize);
            // let trainImage = sk.loadImage(trainListImages[i], img => {sk.image(img, xPos, yPos, shapeSize, shapeSize)});

            setTimeout(trainingZoneDetail, 100, i);

        }
      }
    };

  }

  sk.draw = () => {

    // if(!randomNumberGenerated) {
    //   generateNumberForShape();
    // }
    checkForGameover();

    if (scene === "startgame") {
      startGame();
    }

    if (scene === "joingame") {
      joinGame();
    }

    if (scene === "gamemenu") {
      gameMenu();
    }

    if (scene === "shapegive") {
      shapeGive();
    }

    if (scene === "shapegiveinstructions") {
      shapeGiveInstructions();
    }

    if (scene === "gameover") {
      gameOver();
    }

    if (scene === "shapecheck") {
      // shapecheck needs to be in the draw function for the video capture
      shapeCheck();
    }

    if (scene === "trainingzone") {
      backButton();
    }

    if (scene === "trainingzonedetail") {
      // drawin
      drawTrainingZoneDetail();
    }

  };
}


const P5 = new p5(s);
