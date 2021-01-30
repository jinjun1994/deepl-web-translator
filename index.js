//https://github.com/adblanc/translator/blob/master/src/index.ts

import puppeteer from "puppeteer";
const URL = "https://www.deepl.com/translator";
import Langs from "./lang.js";
const LANGS_SELECTOR = {
  input: {
    button: ".lmt__language_select--source > button:nth-child(1)",
    lang:
      ".lmt__language_select--source > div > button[dl-test=translator-lang-option-${LANG}]",
    text:
      ".lmt__language_select--source > button:nth-child(1) > span:nth-child(1) > strong:nth-child(2)",
  },
  output: {
    button: ".lmt__language_select--target > button:nth-child(1)",
    lang:
      ".lmt__language_select--target > div > button[dl-test=translator-lang-option-${LANG}]",
    text:
      ".lmt__language_select--target > button:nth-child(1) > span:nth-child(1) > strong:nth-child(2)",
  },
};

const INPUT_SELECTOR = "textarea[dl-test=translator-source-input]";

const OUTPUT_SELECTOR = "textarea[dl-test=translator-target-input]";

export default class Translate {
  constructor(headless, input, output) {
    this.input = Langs[input];
    this.output = Langs[output];
    //@ts-ignore
    return (async () => {
   
        this.browser = await this.initBrowser(headless);
        // console.log(this.browser);
        this.page = await this.initPage();
        return this;
  

    })();
  }

   initBrowser(headless) {
    return puppeteer.launch({ headless });
  }

   end() {
    return this.browser.close();
  }

   async initPage() {
    const page = await this.browser.newPage();
    await page.goto(URL);

    await page.waitForTimeout(1000);
    try {
      await page.click(".dl_cookieBanner--buttonClose");
    } catch (ex) {
      console.error("cookie click failed");
    }

    await this.changeInputLang(page);
    await this.changeOutputLang(page);

    return page;
  }

   async changeInputLang(page) {
    const LANG_INPUT_SELECTOR = LANGS_SELECTOR.input.lang.replace(
      "${LANG}",
      this.input.inputValue
    );

    await page.click(LANGS_SELECTOR.input.button);
    await page.waitForTimeout(1000);
    await page.waitForSelector(LANG_INPUT_SELECTOR, { visible: true });
    await page.click(LANG_INPUT_SELECTOR);
  }

   async changeOutputLang(page) {
    const LANG_OUTPUT_SELECTOR = LANGS_SELECTOR.output.lang.replace(
      "${LANG}",
      this.output.outputValue
    );

    await page.click(LANGS_SELECTOR.output.button);
    await page.waitForSelector(LANG_OUTPUT_SELECTOR, { visible: true });
    await page.click(LANG_OUTPUT_SELECTOR);
  }

   async clearInput(selector) {
    const { page } = this;

    await page.focus(selector);
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
  }

   async isTranslating() {
    const { page } = this;

    const el = (await page.$(
      "#dl_translator"
    )) ;
    const classEl = await el.getProperty("className");

    const className = (await classEl.jsonValue()) ;

    return className.includes("active_translation_request");
  }

   async waitTranslation() {
    const { page } = this;

    while (await this.isTranslating()) {
      await page.waitForTimeout(1000);
    }
  }

   async checkLang() {
    const { page } = this;

    const inputLang = await page.$eval(
      LANGS_SELECTOR.input.text,
      (el) => el.textContent
    );
    const outputLang = await page.$eval(
      LANGS_SELECTOR.output.text,
      (el) => el.textContent
    );

    if (inputLang !== this.input.name) await this.changeInputLang(this.page);
    if (outputLang !== this.output.name) await this.changeOutputLang(this.page);
  }

   async getTranslation(sentence) {
    const { page } = this;
    let value;

    if (!sentence.trim()) return sentence;

    await this.checkLang();
    await this.clearInput(OUTPUT_SELECTOR);
    await this.clearInput(INPUT_SELECTOR);
    await page.type(INPUT_SELECTOR, sentence);

    while (!value) {
      await this.waitTranslation();
      await page.waitForTimeout(1000);
      value = await page.$eval(
        OUTPUT_SELECTOR,

        (el, sentence) => {
          if (el.value && !el.value.includes("[...]")) return el.value;
          return null;
        },
        sentence
      );
    }
    return value;
  }
  async translateData(t, data)  {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result[i] = await t.getTranslation(data[i]);
    }
    return result;
  };
}