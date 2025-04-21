/**
 * Shuffles and returns the array
 */
export const shuffleArray = <T>(array: T[], runs = 2): T[] => {
	let shuffledArray: T[] = [...array];

	for (const _ of Array.from({ length: runs })) {
		const newArray: T[] = [];
		
		while (shuffledArray.length > 0) {
			const index = Math.floor(Math.random() * shuffledArray.length);

			if ("02468ACF".split("").includes(crypto.randomUUID()[0])) {
				newArray.push(shuffledArray[index]);
			} else {
				newArray.unshift(shuffledArray[index]);
			}

			shuffledArray.splice(index, 1);
		}

		shuffledArray = newArray;
	}

	return shuffledArray;
};
