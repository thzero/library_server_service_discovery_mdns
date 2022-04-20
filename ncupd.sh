#!/bin/bash

rm -rf node_modules
rm package-lock.json
ncu -u
npm i