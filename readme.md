# Readme

## Basic environment setup
1) Install Node.js (https://nodejs.org/en/)
2) Install Ionic: `npm i -g @ionic/cli`
3) Within this directory, install deps: `npm i`
4) Verify installation: `ionic build`

`ionic cordova plugin add uk.co.workingedge.cordova.plugin.sqliteporter`

## Android
1) Install Cordova CLI: `npm i -g cordova`
2) Install Android Studio and JDK 8+ (https://ionicframework.com/docs/v3/intro/deploying/)
3) Using Android Studio SDK Manager application, install SDK commmand line tools (possibly optional)
4) Install Gradle (https://gradle.org/install/)
5) Install AVD using AVD Manager (enable AMD SVM in BIOS to run)
6) Add ADB to PATH: C:\Users\Adam\AppData\Local\Android\Sdk\platform-tools

## Debug:
`ionic cordova run android --debug -l`
chrome://inspect/#devices