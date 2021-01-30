import Translation from "./index.js";
import Langs from "./lang.js";
const translateData = async (t, data) => {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    result[i] = await t.getTranslation(data[i]);
  }

  return result;
};
(async () => {
  const t = await new Translation(true, Langs.English, Langs.Chinese);
  let result = await translateData(t, ["hello world"], false);
  console.log(result);

})();
