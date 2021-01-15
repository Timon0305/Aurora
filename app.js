const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const electronSettings = require("electron-settings");
const machineUuid = require("machine-uuid");
const { v4: uuidv4 } = require("uuid");
const request = require("request");
const express = require("express");

const isMac = process.platform === "darwin";

let activeTasks = {};
let mainWindow;
let authWindow;
let versionNumber = app.getVersion();

// Creating Main Page
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1516,
    height: 947,
    maxWidth: 1516,
    maxHeight: 947,
    minWidth: 769,
    minHeight: 450,
    title: "Aurora",
    frame: false,
    backgroundColor: "#121229",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      devTools: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "/src/index.html"));

  mainWindow.webContents.on("did-finish-load", () => {

  });
};

app.on("ready", () => {
  auth();
});

const auth = () => {
  let settings = electronSettings.getAll() || {};
  if (settings.key) {
    machineUuid().then((id) => {
      activate(settings.key, id, true);
    });
  } else {
    createAuth();
  }
};

// Creating Login Page
const createAuth = () => {
  authWindow = new BrowserWindow({
    parent: mainWindow,
    width: 1516,
    height: 947,
    maxWidth: 1516,
    maxHeight: 947,
    minWidth: 769,
    minHeight: 450,
    frame: false,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
  });

  authWindow.loadFile(path.join(__dirname, "/src/login.html"));
};

ipcMain.on("attempt-auth", (e, key) => {
  machineUuid().then((id) => {
    activate(key, id);
  });
});

function activate(key, id, boolean = false) {
    let url = {
        url: "#",
        method: "POST",
        headers: { apiKey: "9XG5-GCOW-QMYB-JVKL-AI4A" },
        json: { key, machine: id },
    };
  if (boolean) {
    request(url, (error, res) => {
      if (res.statusCode === 200) {
        createWindow();
      } else {
        if (boolean) {
          electronSettings.set("key", null);
          createAuth();
        } else {
          authWindow.webContents.send(
            "auth-error",
            "Auth Error, contact admin via discord."
          );
        }
      }
    });
  } else {
    createWindow()
  }
}
