# Dataset JSON Manifest Tool

Reads the directorie and file names in the training and testing directories and builds a json file, the directory names as the labels.

## Dataset Directory Structure
```
> datasets
  > dataset_dir_name
    > testing
      > label-1
      > label-n
    > training
      > label-1
      > label-n
```


## JSON Structure
```
{
  "labels": [ "label-1", "label-n" ],
  "training": [
    { "image":"dataset_dir_name/training/label-1/image-1.png", "label": 0 },
    { "image":"dataset_dir_name/training/label-n/image-n.png", "label": 1 },
    ...
    ],
  "testing": [
    { "image":"dataset_dir_name/testing/label-1/image-1.png", "label": 0 },
    { "image":"dataset_dir_name/testing/label-n/image-n.png", "label": 1 },
  ]
}
```

## Create JSON Manifest
```
node app.js --dataset_dir="datasets/dataset_dir_name" --manifest_filename="output/dataset_dir_name.json"
```