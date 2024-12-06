import { CST } from "../CST.mjs";

let staying = true;

var session;
var streams = {};
var subscriber = [];

//subscriber settings
var options = { width: 200, height: 150, insertMode: 'append' }

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.PLAY,
        })
    }

    preload() {

        this.anims.create({
            key: "left",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("man_blue_shirt", {
                frames: [4, 5, 6, 7]
            }),
        })

        this.anims.create({
            key: "right",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("man_blue_shirt", {
                frames: [8, 9, 10, 11]
            }),
        })

        this.anims.create({
            key: "up",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("man_blue_shirt", {
                frames: [12, 13, 14, 15]
            }),
        })

        this.anims.create({
            key: "down",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("man_blue_shirt", {
                frames: [0, 1, 2, 3]
            }),
        })
    }


    create(socket) {

        /////game

        //keys creat
        this.boardAction = true; // проверяет находиться ли пользователь в строке ввода
        this.cursors = this.input.keyboard.createCursorKeys();

        //////////////

        //map
        let mapBegin = this.add.tilemap("mapBegin");
        let terrain = mapBegin.addTilesetImage("assets_for_map_extruded", "terrain", 48, 48, 1, 2);

        //layers
        let backLayer = mapBegin.createStaticLayer("background", [terrain], 0, 0).setDepth(-1);
        let topLayer = mapBegin.createStaticLayer("top", [terrain], 0, 0);


        //map collisions
        topLayer.setCollisionByProperty({ collides: true });

        /////////////////////////////
        var userName = document.getElementById("user-name");

        var self = this;
        this.socket = socket;

        this.otherPlayers = this.physics.add.group();

        this.socket.emit("play", userName.innerText);

        //////////////////////////////////
        //for chat
        var chatText = document.getElementById("global-chat");
        var chatInput = document.getElementById("chat-input");
        var chatForm = document.getElementById("chat-form");
        var chatPivate = document.getElementById("privat-chat");
        var chatSwitch = document.getElementById("chat-switch");

        this.socket.on("addToChat", function (data) {
            chatText.innerHTML += "<div>" + data + "</div>";
        });

        chatForm.onsubmit = (e) => {
            e.preventDefault();
            chatText.innerHTML += "<div>" + "You: " + chatInput.value + "</div>";
            this.socket.emit("sendMsgToServer", chatInput.value);
            chatInput.value = "";
        }

        chatSwitch.onclick = () => {
            if (chatText.style.display == "none") {
                chatText.style.display = "block";
                chatPivate.style.display = "none";
            }
            else {
                chatText.style.display = "none";
                chatPivate.style.display = "block";
            }
        }


        chatInput.addEventListener('focus', (event) => {
            event.target.style.background = 'pink';
            this.boardAction = false;
        });

        chatInput.addEventListener('blur', (event) => {
            event.target.style.background = '';
            this.boardAction = true;
        });

        /////////////////////////////////

        var massSprites = []; //player spriter massive for event

        //main player
        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id], topLayer, massSprites);
                    self.physics.add.overlap(self.character, self.massSprites, (player, object) => {

                    })
                } else {
                    addOtherPlayers(self, players[id], massSprites);
                }
            });
        });

        //other player
        this.socket.on('newPlayer', function (playerInfo) {
            addOtherPlayers(self, playerInfo, massSprites);
        });

        //exit player
        this.socket.on('exit', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        //stand all player to begin
        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    otherPlayer.setTexture("man_blue_shirt", [playerInfo.fram]);
                }
            });
        });

        this.socket.on("updateStreamId", function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.streamId = playerInfo.streamId;
                }
            });
        })


        ////////////////vonage

        //publuisher settings
        var publisherOptions = {
            insertMode: 'append',
            width: 200,
            height: 150,
            name: userName.innerText
        };

        fetch(location.pathname, {
            method: "POST"
        }).then(function (res) {
            return res.json();
        }).then(function (data) {

            session = OT.initSession(data.apiKey, data.sessionId);
            var publisher = OT.initPublisher('publisher', publisherOptions)



            session.on({
                'sessionConnected': function (event) {
                    // each client publishes
                    self.streams = [];
                    self.streamId = session.publish(publisher).streamId;
                    self.socket.emit("addStreamId", self.streamId);
                },
                'streamCreated': function (event) {
                    // store the stream object for later use
                    streams[event.stream.streamId] = event.stream;
                },
                'streamDestroyed': function (event) {
                    // remove the stream object from the storage
                    delete streams[event.stream.streamId];
                }
            });
            session.connect(data.token);
        })

        /////////////////////////////////////////
    }

    update(time = number, delta = number) {

        if (this.character) {
            for (let i in this.otherPlayers.getChildren()) {
                if (!this.otherPlayers.getChildren()[i].body.touching.none) {
                    try {
                        if (this.character && this.streams.indexOf(this.otherPlayers.getChildren()[i].streamId) == -1) {
                            this.streams.push(this.otherPlayers.getChildren()[i].streamId);
                            this.otherPlayers.getChildren()[i].actives = true;
                            subscriber[i] = session.subscribe(streams[this.otherPlayers.getChildren()[i].streamId], "subscriber", options)
                        }
                    }
                    catch { }
                }
                else {
                    if (this.otherPlayers.getChildren()[i].actives === true) {
                        this.otherPlayers.getChildren()[i].actives = false;
                        let deletIndex = this.streams.indexOf(this.otherPlayers.getChildren()[i].streamId);
                        this.streams.splice(deletIndex, 1);
                        try {
                            session.unsubscribe(subscriber[i]);
                        }
                        catch { }
                    }
                }
            }
        }

        if (this.character && this.boardAction) {

            //arrows walking 
            if (this.cursors.right.isDown) {
                this.character.setVelocityX(128);
                this.character.play("right", true);
                this.character.fram = this.character.anims.currentFrame.textureFrame
            }
            else if (this.cursors.left.isDown) {
                this.character.setVelocityX(-128);
                this.character.play("left", true);
                this.character.fram = this.character.anims.currentFrame.textureFrame
            }
            else if (this.cursors.up.isDown) {
                this.character.setVelocityY(-128);
                this.character.play("up", true);
                this.character.fram = this.character.anims.currentFrame.textureFrame
            }
            else if (this.cursors.down.isDown) {
                this.character.setVelocityY(128);
                this.character.play("down", true);
                this.character.fram = this.character.anims.currentFrame.textureFrame
            }
            else this.character.anims.stop();

            if (this.cursors.left.isUp && this.cursors.right.isUp) {
                if (staying) {
                    staying = false;
                    this.character.setVelocityX(1);
                }
                else {
                    staying = true;
                    this.character.setVelocityX(-1);
                }
            }
            if (this.cursors.up.isUp && this.cursors.down.isUp) {
                this.character.setVelocityY(0);
            }

            // генерация события движения
            var x = this.character.x;
            var y = this.character.y;
            var fram = this.character.fram;
            if (this.character.oldPosition && (Math.abs(x - this.character.oldPosition.x) > 2 || y !== this.character.oldPosition.y || fram !== this.character.oldPosition.fram)) {
                this.socket.emit('playerMovement', { x: this.character.x, y: this.character.y, fram: this.character.fram });
            }

            // сохраняем данные о старой позиции
            this.character.oldPosition = {
                x: this.character.x,
                y: this.character.y,
                fram: this.character.fram
            };
        }
    }
}

//function to add main player
function addPlayer(self, playerInfo, topLayers, massSprites) {
    self.character = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'man_blue_shirt').setSize(20, 40, 100, 50);;
    self.fram = 0;
    self.character.setMaxVelocity(200);
    self.physics.add.collider(self.character, topLayers);
    self.cameras.main.startFollow(self.character);

    //for massSprite
    self.creat = true; // player alredy create: for massSprite
    self.massSprites = massSprites;
}

//function add other player
function addOtherPlayers(self, playerInfo, massSprites) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'man_blue_shirt').setSize(100, 100);;
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.actives = false;
    otherPlayer.streamId = playerInfo.streamId;

    self.otherPlayers.add(otherPlayer);
    // for massSprite
    if (self.creat != undefined) self.massSprites.push(otherPlayer);
    else massSprites.push(otherPlayer);
}
