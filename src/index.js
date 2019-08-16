require("./js/script.js");

import * as p5 from "p5";
import "p5/lib/addons/p5.dom";
import * as ml5 from "ml5";

console.log("dag vrienden, welkom in de index.js");

let video;
let features;
let knn;
let labelP;
let requiredP;
let ready = false;
let label = 'nothing';
let required = 'fox';
let foxImg;
let isResultRequired = false;

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
        requiredP.html('goe bezig!');
      } else {
        let isResultRequired = false;
        requiredP.html('show me: ' + required);
      }
      label = result.label;
      labelP.html('Result: ' + result.label);
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
  sk.setup = () => {
      sk.createCanvas(320,240);
      foxImg = sk.createImg('assets/fox.png', imageReady);
      video = sk.createCapture(sk.VIDEO);
      video.size(320,240);
      video.style("transform", "scale(-1,1)");
      features = ml5.featureExtractor('MobileNet', modelReady);
      knn = ml5.KNNClassifier();
      labelP = sk.createP('need training data');
      labelP.style('font-size', '32pt');
      requiredP = sk.createP('show me: ' + required);
      requiredP.style('font-size', '32pt');
  };

  const imageReady = () => {
    sk.image(foxImg, 0, 0, 320, 240);
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

  sk.draw = () => {
    // sk.background(0);
    // if (isResultRequired = true) {
    //   sk.background(0,255,0);
    // };
    // sk.fill(255);
    // sk.textSize(20);
    // sk.text(required, 10, sk.height - 10);


    //image(video, 0, 0);
    if (!ready && knn.getNumLabels() > 0) {
      goClassify();
      ready = true;
    }
  };
}


const P5 = new p5(s);
