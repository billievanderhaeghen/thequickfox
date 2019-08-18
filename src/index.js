require("./js/script.js");
require("./css/style.css");

import * as p5 from "p5";
import "p5/lib/addons/p5.dom";
import * as ml5 from "ml5";

console.log("dag vrienden, welkom in de index.js");

let video;
let features;
let knn;
// let labelP;
// let requiredP;
let ready = false;
let label = 'nothing';
let required = 'fox';
let requiredTwo = 'dog';
let result;
let circular;
let circularBold;
let qImg;
let isResultRequired = false;
let timer = 0;

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
      if (result.label === required) {
        let isResultRequired = true;
        console.log("goe bezig");
      } else {
        let isResultRequired = false;
      }
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
    circular = sk.loadFont('assets/font/C.ttf');
    circularBold = sk.loadFont('assets/font/C_b.ttf');
  }

  sk.setup = () => {
      sk.createCanvas(window.innerWidth, window.innerHeight);
      qImg = sk.createImg('assets/img/shapes/quick-fox.png', imageReady);
      //qImg.translate(window.innerWidth / 2, window.innerHeight / 2)
      qImg.hide();
      video = sk.createCapture(sk.VIDEO);
      video.size(sk.width,sk.height/2);
      video.style("transform", "scale(-1,1)");
      video.hide();
      features = ml5.featureExtractor('MobileNet', modelReady);
      knn = ml5.KNNClassifier();
      // labelP = sk.createP('need training data');
      // labelP.style('font-size', '32pt');
      // requiredP = sk.createP('show me: ' + required);
      // requiredP.style('font-size', '32pt');
  };

  const imageReady = () => {
    sk.background('#262326')
    sk.imageMode(sk.CENTER);
    sk.image(qImg, 0, 120, 300, 300);
    //sk.translate(window.innerWidth / 2, window.innerHeight / 2)
  }

  sk.keyPressed = () => {
    const logits = features.infer(video);
    if (sk.key == 'd') {
      knn.addExample(logits, 'dog');
      console.log('dog');
    } else if (sk.key == 'f') {
      knn.addExample(logits, 'fox');
      console.log('fox');
    } else if (sk.key == 't') {
      knn.addExample(logits, 'triangle');
      console.log('triangle');
    } else if (sk.key == 'e') {
      knn.addExample(logits, 'empty');
      console.log('empty');
    } else if (sk.key == 's') {
      save(knn, 'model.json');
      //knn.save('model.json');
    }
  }

  // const RoundFinishSucces = () => {
  //   sk.background('#FCEE21');
  //   sk.textSize(100);
  //   sk.textAlign(sk.CENTER);
  //   sk.text('+ 5',)
  // }

  sk.draw = () => {
    sk.translate(sk.width / 2, sk.height / 2);
    sk.textFont(circularBold);
    sk.textSize(30);
    sk.textAlign(sk.CENTER);
    sk.fill('#ffffff');
    sk.text('Show your ' + required, 0, sk.height / 2 - sk.height / 8);

    sk.imageMode(sk.CORNER);
    sk.image(video, - sk.width/2, - sk.height/2);
    if (!ready && knn.getNumLabels() > 0) {
      goClassify();
      ready = true;
    }
    if (knn.getNumLabels() > 0) {
      if (label === required) {
        sk.clear();
        sk.background('#FCEE21');
        sk.imageMode(sk.CORNER);
        sk.image(video, - sk.width/2, - sk.height/2);
        sk.textSize(100);
        sk.fill(0);
        sk.text('+ 5', 0, sk.height / 4);
      } else {
        sk.clear();
        sk.background('#FF1C00');
        sk.imageMode(sk.CORNER);
        sk.image(video, - sk.width/2, - sk.height/2);
        sk.textSize(50);
        sk.fill('#ffffff');
        sk.text('Not quite right', 0, sk.height / 4);
      }
    }

  };
}


const P5 = new p5(s);
