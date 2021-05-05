// ./build_installer.js

// 1. Import Modules
const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
// Important: the directories must be absolute, not relative e.g
// appDirectory: "C:\\Users\sdkca\Desktop\OurCodeWorld-win32-x64", 
const APP_DIR = path.resolve(__dirname, './release-builds/chaosobs-win32-x64');
// outputDirectory: "C:\\Users\sdkca\Desktop\windows_installer", 
const OUT_DIR = path.resolve(__dirname, './windows_installer');

// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    // Configure metadata
    description: 'An app to display modals in the OBS window based on youtube live chat',
    exe: 'ChaosOBS',
    name: 'Chaos OBS',
    manufacturer: 'Zacky VT',
    shortcutFolderName: 'Chaos OBS',
    appIconPath: path.resolve(__dirname,'./resources/icon.ico'),
    version: '1.1.1',
    upgradeCode: 'D58B2D6D-88A2-4CE3-83C4-F8C5845D147D',

    // Configure installer User Interface
    ui: {
        chooseDirectory: true
    },
    features: {
        autoUpdate: true,
    },
});

// 4. Create a .wxs template file
msiCreator.create().then(function(){

    // Step 5: Compile the template to a .msi file
    msiCreator.compile();
});