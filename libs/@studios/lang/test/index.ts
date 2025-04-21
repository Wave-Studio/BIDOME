import { YamlLoaderPlugin } from "@studios/lang"

const plugin = new YamlLoaderPlugin("./lang");

console.log(await plugin.load())