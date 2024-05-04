import { autorun, makeAutoObservable } from "mobx";
import { PART_SPEACH, VERBS, PRONOUNS, LESSONS, NOUNS, RUSSIAN_CASES_PART } from "../../../data/index.js";
import {
    actualValue,
    getRandomIntegers,
    shuffleArray,
} from "../../../utils/index.js";
import { getChangedVerb } from "../../../utils/index.js";
import { getChangedNoun } from "../../../utils/getChangedNoun.js";
import { messageStore } from "../MessageStore.js";
const myMessageStore = messageStore;


class SecondLessonStore {
    trueTaskValue = {};
    falseTaskNouns = [];
    falseTaskPronouns = [];
    variants = [];
    userAnswer = [];

    constructor() {
        makeAutoObservable(this);

        autorun(() => this.getLessonData());
    }

    resetTask = () => {
        this.trueTaskValue = {};
        this.falseTaskNouns = [];
        this.falseTaskPronouns = [];
        this.variants = [];
        this.userAnswer = [];
    };

    getLessonData = () => {
        this.getTask();
        this.getVariants();
    };

    setTrueTaskValue = (obj) => {
        this.trueTaskValue = obj;
    };

    setFalseTaskNouns = (arr) => {
        this.falseTaskNouns = arr;
    };

    setFalseTaskPronouns = (arr) => {
        this.falseTaskPronouns = arr;
    };

    setVariants = (arr) => {
        this.variants = arr;
    };

    getAnotherTask = () => {
        this.resetTask();
        this.getTask();
        this.getVariants();
    };

    getVariants = () => {
        // const pronounsArray = [
        //     ...this.falseTaskPronouns,
        //     this.trueTaskValue.pronoun.value,
        // ];

        const nounsArray = [...this.falseTaskNouns, this.trueTaskValue.value];

        //const pronouns = shuffleArray(pronounsArray);
        const nouns = shuffleArray(nounsArray);

        //const variants = [...pronouns, ...nouns].map((item, index) => {
        const variants = [...nouns].map((item, index) => {
            const miniObj = {
                id: index + 1,
                value: item,
            };

            return miniObj;
        });
        this.setVariants([...variants]);
    };

    checkAnswer = () => {
        if (!this.userAnswer.length) {
            return;
        }

        const userAnswerArray = this.userAnswer.map((e) => e.value);

        const userAnswer = userAnswerArray.join(" ");
        const trueAnswer = `${this.trueTaskValue.value}`;
        
        if (userAnswer === trueAnswer) {
            myMessageStore.handleSuccess();
            setTimeout(() => {
                this.resetTask();
                this.getAnotherTask();
                myMessageStore.setResult("");
            }, 2000);
        } else {
            myMessageStore.handleError();
            setTimeout(() => {
                myMessageStore.setResult("");
            }, 2000);
        }
    };

    setUserAnswer = (variant) => {
        this.variants = this.variants.filter((v) => v.id !== variant.id);
        this.userAnswer = [...this.userAnswer, variant];
        this.userAnswer = this.userAnswer.sort((a, b) => a.id - b.id);
    };

    deleteOneUserAnswerItem = (answer) => {
        this.variants = [...this.variants, answer];
        this.userAnswer = this.userAnswer.filter((a) => a.id !== answer.id);
        this.variants = this.variants.sort((a, b) => a.id - b.id);
    };

    getTask = () => {

        const trueTaskValue = this.getTrueTaskValue();

        const { value } = trueTaskValue;

        const falseTaskNouns = this.getFalseValues(value, PART_SPEACH.NOUN);

        console.log(trueTaskValue)


        this.setTrueTaskValue(trueTaskValue);
        this.setFalseTaskNouns(falseTaskNouns);
        //this.setFalseTaskPronouns(falseTaskPronouns);
    };

    getFalseValues = (value, parametr) => {
        const arr = [];

        switch (parametr) {
            case PART_SPEACH.VERB:
                for (let i = 0; i < 6; i++) {
                    const { pronounId, timeId, verbId, negativeId } =
                        getRandomIntegers();

                    const item = getChangedVerb(
                        verbId,
                        pronounId,
                        timeId,
                        negativeId
                    );

                    if (value !== item) {
                        arr.push(item);
                    }
                }
                break;
            case PART_SPEACH.PRONOUN:
                for (let i = 0; i < 5; i++) {
                    const { pronounId } = getRandomIntegers();
                    const [pronoun] = actualValue(PRONOUNS, pronounId);

                    const item = pronoun.value;

                    if (value !== item) {
                        arr.push(item);
                    }
                }
                break;
            case PART_SPEACH.NOUN:
                for (let i = 0; i < 4; i++) {
                    const { nounId } = getRandomIntegers();

                    const [noun] = actualValue(NOUNS, nounId);

                    const item = noun.fullValue;
                    if (value !== item) {
                        arr.push(item);
                     }
                }
                break;                
            default:
                break;
        }

        return [...new Set(arr)];
    };

    getTrueTaskValue = () => {
        const lessonId = LESSONS.SECOND;
        const { nounId, caseId } = getRandomIntegers();
        const [noun] = actualValue(NOUNS, nounId);
        const casePart = RUSSIAN_CASES_PART[caseId]
        const value = getChangedNoun(nounId, caseId);

        return {
            lessonId,
            noun,
            value,
            caseId,
            casePart
        };
    };
}

export const secondLessonStore = new SecondLessonStore();