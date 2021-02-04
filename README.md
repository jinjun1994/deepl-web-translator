

Free API translation using deepl web

## Installation
```
npm i deepl-web-translator --save
```



## API key

No key required

## Supported languages

`"English" "Chinese" "French" "German" "Spanish" "IPortugueseT" "Italian" "Dutch" "Polish" "Russian"`

## Usage

``` js
import Translation from "./index.js";


(async () => {
  const t = await new Translation(true, "English", "Chinese");
  let result = await t.translateData(t, ["hello world"]);
  console.log(result); // 你好，世界

})();
```



## License

MIT