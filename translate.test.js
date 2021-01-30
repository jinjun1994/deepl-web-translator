import Translation from "./index.js";


(async () => {
  const t = await new Translation(true, "English", "Chinese");
  let result = await t.translateData(t, ["hello world"]);
  console.log(result);

})();
