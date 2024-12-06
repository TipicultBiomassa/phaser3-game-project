"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poll = void 0;
class Poll {
    constructor(id, pollInfo, pollCreator) {
        this.addVote = (answerId) => {
            let countOfVotes = this.votes.get(answerId);
            countOfVotes++;
            this.votes.set(answerId, countOfVotes);
            return { answerId, countOfVotes };
        };
        this.getVotes = () => {
            return this.votes;
        };
        this.id = id;
        this.answers = pollInfo.answers;
        this.title = pollInfo.title;
        this.question = pollInfo.question;
        this.pollCreator = pollCreator;
        this.votes = new Map();
    }
    set answers(value) {
        this._answers = value;
    }
    get answers() {
        return this._answers;
    }
}
exports.Poll = Poll;
//# sourceMappingURL=poll.js.map