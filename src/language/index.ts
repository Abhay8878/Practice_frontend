// import LocalizedStrings from "react-localization"
// import en from "./en.json"
// import fr from "./fr.json"
 
// const strings = new LocalizedStrings({
//   en: en,
//   fr: fr,
// })
 
// export default strings
 // src/language/index.ts
import en from "./en.json";
import fr from "./fr.json";
import sp from "./sp.json"
import jp from "./jp.json"

const strings = {
  en,
  fr,
  sp,
  jp,
};

export type LanguageKey = keyof typeof strings;
export default strings;
