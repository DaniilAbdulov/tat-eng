import {autorun, makeAutoObservable} from 'mobx';
import {
  PART_SPEACH,
  LESSONS,
  NOUNS,
  ADJECTIVES,
} from '../../../data/index.js';
import {
  actualValue,
  getFalseValues,
  getRandomIntegers,
  shuffleArray,
  getChangedNoun,
  getChangedAdjective,
} from '../../../utils/index.js';
import {progressStore} from '../ProgressStore.js';
const myProgressStore = progressStore;

class ThirthLessonStore {
  trueTaskValue = {};
  falseTaskAdjectives = [];
  falseTaskNouns = [];
  falseTaskSecondNouns = [];
  variants = [];
  userAnswer = [];

  constructor() {
    makeAutoObservable(this);

    autorun(() => this.getLessonData());
  }

  resetTask = () => {
    this.trueTaskValue = {};
    this.falseTaskAdjectives = [];
    this.falseTaskPronouns = [];
    this.variants = [];
    this.userAnswer = [];
  };

  getLessonData = () => {
    this.getTask();
    this.getVariants();
  };

  setTrueTaskValue = obj => {
    this.trueTaskValue = obj;
  };

  setFalseTaskAdjectives = arr => {
    this.falseTaskAdjectives = arr;
  };

  setFalseTaskNouns = arr => {
    this.falseTaskNouns = arr;
  };

  setFalseTaskSecondNouns = arr => {
    this.falseTaskSecondNouns = arr;
  };

  setVariants = arr => {
    this.variants = arr;
  };

  getAnotherTask = () => {
    this.resetTask();
    this.getTask();
    this.getVariants();
  };

  getVariants = () => {
    const nounsArray = [...this.falseTaskNouns, this.trueTaskValue.nounValue];
    const nouns = shuffleArray(nounsArray);

    const secondNounsArray = [
      ...this.falseTaskSecondNouns,
      this.trueTaskValue.secondNounValue,
    ];
    const secondNouns = shuffleArray(secondNounsArray);

    const adjectivesArray = [
      ...this.falseTaskAdjectives,
      this.trueTaskValue.valueAdjective,
    ];

    const adjectives = shuffleArray(adjectivesArray);

    const variants = [...nouns, ...secondNouns, ...adjectives].map(
      (item, index) => {
        const miniObj = {
          id: index + 1,
          value: item,
        };

        return miniObj;
      },
    );
    this.setVariants([...variants]);
  };

  checkAnswer = () => {
    if (!this.userAnswer.length) {
      return;
    }
    const {trueTaskValue} = this;

    const userAnswerArray = this.userAnswer.map(e => e.value);

    const userAnswer = userAnswerArray.join('');
    const trueAnswer =
      trueTaskValue.nounValue +
      trueTaskValue.secondNounValue +
      trueTaskValue.valueAdjective;

    if (userAnswer === trueAnswer) {
      myProgressStore.handleSuccess();
      setTimeout(() => {
        this.resetTask();
        this.getAnotherTask();
        myProgressStore.setResult('');
      }, 2000);
    } else {
      myProgressStore.handleError();
      setTimeout(() => {
        myProgressStore.setResult('');
      }, 2000);
    }
  };

  setUserAnswer = variant => {
    this.variants = this.variants.filter(v => v.id !== variant.id);
    this.userAnswer = [...this.userAnswer, variant];
    this.userAnswer = this.userAnswer.sort((a, b) => a.id - b.id);
  };

  deleteOneUserAnswerItem = answer => {
    this.variants = [...this.variants, answer];
    this.userAnswer = this.userAnswer.filter(a => a.id !== answer.id);
    this.variants = this.variants.sort((a, b) => a.id - b.id);
  };

  getTask = () => {
    const trueTaskValue = this.getTrueTaskValue();
    const {noun, adjective, secondNounValue} = trueTaskValue;
    const falseTaskAdjectives = getFalseValues(
      adjective,
      PART_SPEACH.ADJECTIVE,
    );
    const falseTaskNouns = getFalseValues(
      noun,
      PART_SPEACH.NOUN,
      LESSONS.THIRD,
    );
    const falseTaskSecondNouns = getFalseValues(
      secondNounValue,
      PART_SPEACH.NOUN,
      LESSONS.THIRD,
    );

    this.setTrueTaskValue(trueTaskValue);
    this.setFalseTaskAdjectives(falseTaskAdjectives);
    this.setFalseTaskNouns(falseTaskNouns);
    this.setFalseTaskSecondNouns(falseTaskSecondNouns);
  };

  getTrueTaskValue = () => {
    const lessonId = LESSONS.THIRD;
    const {nounId, adjectiveId} = getRandomIntegers();
    const [noun] = actualValue(NOUNS, nounId);
    const [adjective] = actualValue(ADJECTIVES, adjectiveId);
    const {nounId: secondNounId} = getRandomIntegers();
    const [secondNoun] = actualValue(NOUNS, secondNounId);

    const valueAdjective = getChangedAdjective(adjective);
    const secondNounValue = getChangedNoun(secondNounId, 6, 2);

    return {
      lessonId,
      noun,
      nounValue: noun.fullValue,
      valueAdjective,
      secondNounValue,
      adjective,
      secondNoun,
    };
  };
}

export const thirthLessonStore = new ThirthLessonStore();
