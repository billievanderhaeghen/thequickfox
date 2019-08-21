import * as p5 from "p5";
import "p5/lib/addons/p5.dom";
import * as ml5 from "ml5";
import io from "socket.io-client";

let video;
let features;
let knn;

let ready = false;
let label = 'nothing';
let requiredArray;
let required;
let requiredUrl;
let requiredImg;
let randomShapeForRound;
let circular;
let circularBold;
let quImage;
let trainListImages = [];
let isResultRequired;
let logo;
let finishedButton;

let checkShapeSuccessCounter;
let checkShapeFailCounter;

let trainingDetail;
let trainingDetailImg;

let yellow;
let red;
let black;
let gray;
let lightGray;

let scene;
let score;

let trainButtonPressed= false;
let trainZoneButtonPressed = false;
let startGameButtonPressed = false;
let finishButtonPressed = false;
let backButtonPressed = false;

const socket = io('192.168.43.7:8081');


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


let myId;
let targetId = false;

socket.on('connectionUrl', socketId => {
  console.log("connection made");
  console.log("socketid: " + socketId);
  myId = socketId;
})

socket.on(`startGame`, id => {
  if (!targetId) {
    targetId = id;
  }
  document.write(myId + " " + targetId);
  console.log(myId + " " + targetId);
})

const $input = document.createElement('input');
const $submit = document.createElement('input');
$input.setAttribute('type', 'text');
$input.setAttribute('name', 'inputfield');
$submit.setAttribute('type', 'submit');
$submit.setAttribute('value', 'submit');
const $body = document.querySelector('body');
$body.appendChild($input);
$body.appendChild($submit);

const submitTargetId = () => {
  //console.log($input.value);
  targetId = $input.value;
  socket.emit(`joinGame`, targetId, { myId: myId});
}

$submit.addEventListener("click", submitTargetId);

const modelReady = () => {
  console.log('model ready!');
  // Comment back in to load your own model!
  knn.load('./datasets/model.json', console.log('knn loaded'));
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
    circular = sk.loadFont('assets/font/C.otf');
    circularBold = sk.loadFont('assets/font/C_b.otf');
    quImage = sk.loadImage('assets/img/shapes/quick-fox.png');
    logo = sk.loadImage('assets/img/tqf-logo.png');
  }

  sk.setup = () => {
      sk.createCanvas(window.innerWidth, window.innerHeight);

      yellow = sk.color(252, 238, 33);
      red = sk.color(255, 28, 0);
      black = '#262326';
      gray = '#4F4C4F';
      lightGray = '#706E70';

      //scene = "shapegive";
      score = 0;

      //set lines in comment to get a random shape
      // requiredArray = shapes[3];
      // required = requiredArray[1];
      // requiredUrl = 'assets/img/shapes/' + requiredArray[0] + '.png';

      scene = "gamemenu";

      features = ml5.featureExtractor('MobileNet', modelReady);
      knn = ml5.KNNClassifier();

      // video = sk.createCapture({
      //   audio: false,
      //   video: {
      //     facingMode: "environment"
      //   }
      // });
      video = sk.createCapture(sk.VIDEO);
      video.size(sk.width,sk.height/2);
      video.style("transform", "scale(-1,1)");
      video.hide();
  };

  const gameMenu = () => {

    sk.resizeCanvas(window.innerWidth, window.innerHeight);

    scene = "gamemenu";

    sk.clear();
    sk.background(black);

    sk.imageMode(sk.CENTER);

    sk.image(logo, sk.width / 2, sk.height / 4, sk.width * 0.8, sk.width * 0.08);
    sk.image(quImage, sk.width / 2, sk.height / 8, sk.width * 0.35, sk.width * 0.35);

    sk.image(video, 0,0);

    sk.textAlign(sk.CENTER);
    sk.textFont(circular);

    //trainzonebutton
    if (!trainZoneButtonPressed) {
      sk.fill('#ffffff');
    } else {
      sk.fill((yellow));
      //setTimeout(trainZoneButtonPressed = false, 5000);
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
    sk.textSize(25);
    sk.text(buttonText, sk.width / 2, sk.height - (sk.height / 16) + 7);

    //join button

    sk.fill(255);
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
    sk.fill(0);
    sk.text(myId, sk.width / 2, sk.height - (sk.height / 16) - 78);

    //start button
    //sk.fill(yellow);
    if (!startGameButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill((255));
      //setTimeout(trainZoneButtonPressed = false, 5000);
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 170, sk.width * 0.9, 60);
    sk.fill(0)
    sk.text('START GAME', sk.width / 2, sk.height - (sk.height / 16) - 163)

  }

  sk.windowResized = () => {
    //console.log("resized");
    //sk.resizeCanvas(window.innerWidth, window.innerHeight);
    //trainingZone();
  }

  const trainingZone = () => {
    scene = "trainingzone";
    sk.resizeCanvas(window.innerWidth, window.innerHeight * 1.5);
    sk.clear();
    sk.background(black);

    // header

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.imageMode(sk.CENTER);
    // 1/4th of innerHeight
    //sk.loadImage(logo, img => {sk.image(img, sk.width / 2, sk.height / 6, sk.width * 0.8, sk.width * 0.08)});
    sk.image(logo, sk.width / 2, sk.height / 6, sk.width * 0.8, sk.width * 0.08)
    // 1/8th of innerHeight
    sk.image(quImage, sk.width / 2, sk.height / 12, sk.width * 0.35, sk.width * 0.35)

    //instruction button
    sk.rectMode(sk.CENTER);
    sk.noStroke();
    sk.fill('#ffffff');
    sk.rect(sk.width / 2, sk.height - (sk.height / 16), sk.width * 0.9, 60);
    sk.fill(black);
    sk.triangle(sk.width,sk.height - (sk.height / 16) - 35, sk.width,sk.height - (sk.height / 16) + 60, sk.width * 0.8,sk.height - (sk.height / 16) - 35);
    sk.fill(yellow);
    sk.triangle(sk.width * 0.97, sk.height - (sk.height / 16) - 30, sk.width * 0.873, sk.height - (sk.height / 16), sk.width * 0.8,sk.height - (sk.height / 16) - 30);

    sk.textAlign(sk.CENTER);
    sk.textFont(circularBold);
    sk.textSize(25);
    sk.fill(yellow);
    // 0.3105 of innerHeight
    sk.text('TRAINING ZONE', sk.width / 2, sk.height * 0.207);

    backButton();

    //show all shapes
    for (var i = 0; i < shapes.length; i++) {
      trainListImages[i] = 'assets/img/shapes/' + shapes[i][0] + '.png';

      sk.fill(gray);
      sk.noStroke();
      sk.rectMode(sk.CENTER);

      let remainder = i%3;
      let divided = i / 3;
      let shapeSize = sk.width / 4;
      let border = sk.width / 16;
      let xPos = sk.width * (1/5 + (1.5/5 * remainder));
      let yPos = (sk.height / 3.65) + ((shapeSize + border) * Math.floor(divided));

      let trainShape = sk.rect(xPos, yPos, shapeSize, shapeSize);
      let trainImage = sk.loadImage(trainListImages[i], img => {sk.image(img, xPos, yPos, shapeSize, shapeSize)});
    }
  }

  const backButton = () => {
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
  }

  const trainingZoneDetail = (detail) => {

    sk.resizeCanvas(window.innerWidth, window.innerHeight);

    trainingDetail = detail;
    trainingDetailImg = sk.loadImage('assets/img/shapes/' + shapes[trainingDetail][0] + '.png');

    video = sk.createCapture(sk.VIDEO);
    video.size(sk.width,sk.height/2);
    video.style("transform", "scale(-1,1)");
    video.hide();

    scene = "trainingzonedetail";

  }

  const drawTrainingZoneDetail = () => {

    sk.clear();
    sk.background(black);

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

    sk.imageMode(sk.CORNER);
    sk.image(video, 0, sk.height / 3);

    if (!ready && knn.getNumLabels() > 0) {
      goClassify();
      ready = true;
    }

  }

  const shapeGiveSetup = () => {

    randomShapeForRound = shapes[Math.floor(Math.random() * shapes.length)];
    requiredArray = randomShapeForRound;
    required = requiredArray[1];
    requiredUrl = 'assets/img/shapes/' + requiredArray[0] + '.png';
    requiredImg =  sk.loadImage(requiredUrl);

    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;

    scene = "shapegive";

  }

  const shapeGive = () => {

    //layout
    sk.clear();
    sk.background(black);
    sk.translate(sk.width - sk.width, sk.height - sk.height);
    sk.imageMode(sk.CENTER);

    //sk.loadImage(requiredUrl, img => { sk.image(img, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7)});
    sk.image(requiredImg, sk.width / 2, sk.height / 3, sk.width * 0.7, sk.width * 0.7);

    sk.textFont(circularBold);
    sk.textSize(35);
    sk.textAlign(sk.CENTER);
    sk.fill('#ffffff');

    //"make a" vs. "make an"
    if (required.charAt(0) === "a" ||required.charAt(0) === "e" ||required.charAt(0) === "i" ||required.charAt(0) === "o" ||required.charAt(0) === "u" ||required.charAt(0) === "x") {
      sk.text('Make an ' + required, sk.width / 2, sk.height / 2 + 40);
    } else {
      sk.text('Make a ' + required, sk.width / 2, sk.height / 2 + 40);
    }

    //finish button
    sk.textSize(25);
    if (!finishButtonPressed) {
      sk.fill(yellow);
    } else {
      sk.fill((255));
    }
    sk.rect(sk.width / 2, sk.height - (sk.height / 16) - 85, sk.width * 0.9, 60);
    sk.fill(0)
    sk.text("I'M FINISHED", sk.width / 2, sk.height - (sk.height / 16) - 78);

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
    video.size(sk.width,sk.height/2);
    video.style("transform", "scale(-1,1)");
    video.elt.setAttribute('playsinline', '');
    video.hide();
    console.log(video);
  };

  const shapeCheck = () => {
    sk.clear();
    // sk.background(black);
    //
    // sk.translate(0, 0);
    // sk.imageMode(sk.CENTER);
    //
    // sk.image(requiredImg, sk.width / 2, sk.height * 0.68, sk.width * 0.6, sk.width * 0.6);
    //
    // sk.translate(sk.width / 2, sk.height / 2);
    // sk.textFont(circularBold);
    // sk.textSize(30);
    // sk.textAlign(sk.CENTER);
    // sk.fill('#ffffff');
    // sk.text('Show your ' + required, 0, sk.height / 2 - sk.height / 8);
    //
    sk.translate(0, 0);
    sk.imageMode(sk.CORNER);
    sk.image(video, 0, 0, sk.width, sk.height / 2);
    //
    // if (!ready && knn.getNumLabels() > 0) {
    //   goClassify();
    //   ready = true;
    // }
    // if (knn.getNumLabels() > 0) {
    //   if (label === "empty") {
    //     console.log("try to aim your camera to your origami creation");
    //   } else {
    //     if (label === required) {
    //       checkShapeSuccessCounter++;
    //       console.log(checkShapeSuccessCounter);
    //       if (checkShapeSuccessCounter > 60) {
    //         shapeSuccess();
    //         return
    //       }
    //     } else {
    //       checkShapeFailCounter++;
    //       console.log(checkShapeFailCounter);
    //       if (checkShapeFailCounter > 60) {
    //         shapeFail();
    //         return
    //       }
    //     }
    //   }
    // }
  }

  const shapeSuccess = () => {
    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;
    scene = "shapesuccess";
    score = score + 5;
    console.log("score: " + score);
    sk.clear();

    sk.background(yellow);
    sk.imageMode(sk.CORNER);
    sk.image(video, - sk.width/2, - sk.height/2);
    sk.textSize(100);
    sk.fill(0);
    sk.text('+ 5', 0, sk.height / 4);
    //isResultRequired = true;
    setTimeout(shapeGive, 3000);

    //stop video capture
  }

  const shapeFail = () => {
    checkShapeSuccessCounter = 0;
    checkShapeFailCounter = 0;
    scene = "shapefail";
    console.log("score: " + score);
    sk.clear();
    sk.background(red);
    sk.imageMode(sk.CORNER);
    sk.image(video, - sk.width/2, - sk.height/2);
    sk.textSize(50);
    sk.fill('#ffffff');
    sk.text('Not quite right', 0, sk.height / 4);
    //isResultRequired = false;
    setTimeout(shapeGive, 3000);

    //stop video capture
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
    if (scene === "gamemenu") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        setTimeout(trainingZone(), 200);
        trainZoneButtonPressed = false;
      }

      if(sk.mouseX > sk.width * 0.1 &&
        sk.mouseX < sk.width * 0.9 &&
        sk.mouseY > sk.height - (sk.height / 16) - 200 &&
        sk.mouseY < sk.height - (sk.height / 16) - 140 ){
        startGameButtonPressed = false;
        shapeGiveSetup();
      }
    }

    if (scene === "shapegive") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 85 && sk.mouseY < sk.height - (sk.height / 16) - 25 ){
        finishButtonPressed = false;
      }
    }

    if (scene === "trainingzonedetail") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        trainingZone();
        backButtonPressed = false;
        //stop video capture
      }
    }

    if (scene === "trainingzone") {
      if (sk.mouseX > 0 && sk.mouseX < 90 && sk.mouseY > 40 && sk.mouseY < 100) {
        gameMenu();
        backButtonPressed = false;
      }
    }


  }


  sk.touchStarted = () => {

    if (scene === "gamemenu") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > (sk.height - (sk.height / 16) - 30) && sk.mouseY < (sk.height - (sk.height / 16) + 30) ){
        trainZoneButtonPressed = true;
      }

      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 200 && sk.height - (sk.height / 16) - 140 ){
        startGameButtonPressed = true;
      }

    }

    if (scene === "shapegive") {
      if(sk.mouseX > sk.width * 0.1 && sk.mouseX < sk.width * 0.9 && sk.mouseY > sk.height - (sk.height / 16) - 85 && sk.mouseY < sk.height - (sk.height / 16) - 25 ){
        finishButtonPressed = true;
        shapeCheckSetUp();
      }
    }

    if (scene === "trainingzonedetail") {
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
        sk.fill(lightGray);
        sk.noStroke();
        sk.rectMode(sk.CENTER);

        let remainder = i%3;
        let divided = i / 3;
        let shapeSize = sk.width / 4;
        let border = sk.width / 16;
        let xPos = sk.width * (1/5 + (1.5/5 * remainder));
        let yPos = (sk.height / 3.65) + ((shapeSize + border) * Math.floor(divided));

        //check if mouseposition is on shape
        if (
          sk.mouseX > (xPos - (shapeSize / 2)) &&
          sk.mouseX < (xPos + (shapeSize / 2)) &&
          sk.mouseY > (yPos - (shapeSize / 2)) &&
          sk.mouseY < (yPos + (shapeSize / 2))
        ) {
            // style
            let trainShape = sk.rect(xPos, yPos, shapeSize, shapeSize);
            let trainImage = sk.loadImage(trainListImages[i], img => {sk.image(img, xPos, yPos, shapeSize, shapeSize)});


            setTimeout(trainingZoneDetail, 100, i);

        }
      }
    };

  }

  sk.draw = () => {

    if (scene === "gamemenu") {
      gameMenu();
    }

    if (scene === "shapegive") {
      shapeGive();
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
