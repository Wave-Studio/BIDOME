// TODO: Work on this - Bloxs

let str = "I have a cat, a dog, and a goat.";
const mapObj = {
	cat: "dog",
	dog: "goat",
	goat: "cat",
};
str = str.replace(/cat|dog|goat/gi, function (matched) {
	return mapObj[matched as keyof typeof mapObj];
});
