/** @type {import("../typings/phaser")} */
import { LoadScene } from "./scenes/LoadScene.mjs";
import { MenuScene } from "./scenes/MenuScene.mjs";
import { PlayScene } from "./scenes/PlayScene.mjs";

var config = {
    type: Phaser.AUTO,
    parent: document.getElementById("game"),
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [
        LoadScene, MenuScene, PlayScene
    ]
};


const game = new Phaser.Game(config);





