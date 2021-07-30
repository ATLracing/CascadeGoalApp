# Cascade Task Organizer
Cascade is an open-source task organizing app for Android and iOS. It helps users achieve steady, incremental progress on important life goals, by breaking them into smaller, actionable tasks, and tackling them in week-long sprints.

Cascade is written in Typescript, and is built on the Ionic/Angular framework. It is merely a hobby project, and is provided without warranty, express or implied.

## Setting up the Node/Ionic development environment
1) Install Node.js (https://nodejs.org/en/)
2) Install Ionic: `npm i -g @ionic/cli`
3) Within this directory, install deps: `npm i`
4) Verify installation: `ionic build`

## Setting up the Android development environment
1) Install Cordova CLI: `npm i -g cordova`
2) Install Android Studio and JDK 8+ (https://ionicframework.com/docs/v3/intro/deploying/)
3) Using Android Studio SDK Manager application, install SDK commmand line tools (possibly optional)
4) Install Gradle (https://gradle.org/install/)
5) Install AVD using AVD Manager (enable AMD SVM in BIOS to run)
6) Add ADB to PATH (located at *C:\Users\\<user name\>\AppData\Local\Android\Sdk\platform-tools* on Windows)

## Setting up the iOS development environment
TODO: Add instructions for iOS targets. For now, see the [official Ionic iOS development guide](https://ionicframework.com/docs/developing/ios).

## Building, running, and debugging
Use the following scripts to build and run the project:
* `./run [--device|--emulator]` -- Build and run the application for debugging (to inspect the application in Chrome, navigate to *chrome://inspect/#devices*)
* `./build_release` -- Build the application for release (the resulting apk can be found at *./platforms/android/app/build/output/apk/release*)