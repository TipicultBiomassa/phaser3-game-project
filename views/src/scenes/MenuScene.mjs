import { CST } from "../CST.mjs";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.MENU,
        })
    }

    init() {

    }

    create() {
        this.socket = io();

        var userEmail = document.getElementById("user-email");
        this.socket.emit("playerInMenu", userEmail.innerText);

        this.add.image(0, 0, "background").setOrigin(0).setDepth(0);
        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "btnPlay").setOrigin(0).setDepth(0).setDisplaySize(100, 60);

        playButton.setInteractive();

        playButton.on("pointerup", () => { // нажатие
            document.getElementById("chating").style.display = "block";

            this.scene.start(CST.SCENES.PLAY, this.socket);
        })
    }
}