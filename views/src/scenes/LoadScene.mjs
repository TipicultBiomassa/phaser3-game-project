import { CST } from "../CST.mjs";

export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.LOAD,
        })
    }

    init() {

    }

    preload() {
        this.load.image("background", "./assets/colored.png");
        this.load.image('btnPlay', './assets/1200px-Play_logo.png');
        this.load.spritesheet("man_blue_shirt", "./assets/sprites/man_blue_shirt.png", { frameHeight: 64, frameWidth: 48 });

        //map assets
        this.load.image("terrain", './assets/assets_for_map_extruded.png')

        //map begin
        this.load.tilemapTiledJSON("mapBegin", "./assets/maps/test_map.json");
    }

    create() {
        this.scene.start(CST.SCENES.MENU);
    }
}