const fs = require('fs');
const fg = require("fast-glob");
const fse = require("fs-extra");
const path = require("path");
const minimist = require("minimist");

// let dataset = {
//   labels: ['facepalm', 'peace'],
//   training: [
//     {
//       image: 'url',
//       label: 0
//     },
//     ...
//   ],
//   testing: [
//     {
//       image: 'url',
//       label: 0
//     },
//     ...
//   ]
// }

let args = minimist(process.argv.slice(2), {
  string: ["dataset_dir", "manifest_filename"],
  boolean: true,
  default: {
    dataset_dir: 'dataset',
    manifest_filename: 'manifest.json',
  }
});

let dataset = {}

async function getSubDir(imagesDirectory, subDir = 'training') {
  let training = await readImagesDirectory(`${imagesDirectory}/${subDir}`)
  return training
} 

async function readImagesDirectory(imagesDirectory) {
  const directories = await getDirectories(imagesDirectory).catch((e) => { console.log('getDirectories:', e) });
  // console.log('directories', directories)
  const result = await Promise.all(
      directories.map(async directory => {
          const p = path.join(imagesDirectory, directory);
          return getImagesInDirectory(p).then(images => {
              return { label: directory, images: images };
          });
      })
  );

  return result;
}

async function getDirectories(imagesDirectory) {
  return await fse.readdir(imagesDirectory).catch((e) => { console.log('fse.readdir:', e) });
}

async function getImagesInDirectory(directory) {
  return await fg([
      path.join(directory, "*.jpg"),
      path.join(directory, "*/*.jpg"),
      path.join(directory, "*.png"),
      path.join(directory, "*/*.png")
  ]);
}

async function buildDataset(imagesDirectory) {
  let trainingData = await getSubDir(imagesDirectory)
  let testingData = await getSubDir(imagesDirectory, 'testing')

  let labels = trainingData.map(g => g.label)
  dataset.labels = labels

  const trainingArr = addToDataset(trainingData)
  dataset.training = trainingArr

  const testingArr = addToDataset(testingData)
  dataset.testing = testingArr
}

function addToDataset(data) {
  let index = 0
  let imgArr = []
  for (let group of data) {

    for (let image of group.images) {
      imgArr.push({
        image: image,
        label: index
      })
    }

    index++
  }

  return imgArr
}

if (!args.dataset_dir) {
  throw new Error("--dataset_dir not specified.");
}

buildDataset(args.dataset_dir).then(() => {
  const json = JSON.stringify(dataset) 
  fs.writeFile(args.manifest_filename, json, 'utf8', () => {
    console.log(`created ${args.manifest_filename}`)
  });
})
