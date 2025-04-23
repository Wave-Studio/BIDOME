import { Language, YamlLoaderPlugin } from "@studios/lang";

const lang = await new Language().load(new YamlLoaderPlugin("./lang"));

console.log(lang.get("test.hello", "testing"));
