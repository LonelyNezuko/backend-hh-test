const alphabet = "abcdefghijklmnopqrstuvwxyz"
const num = "0123456789"

const random = {
	number: (length: number = 4): number => {
		let result = ''
		for(let i = 0; i < length; i ++) result += num.charAt(Math.floor(Math.random() * num.length));

		return parseInt(result);
	},
	text: (length: number = 4): string => {
		let result = ''
		for(let i = 0; i < length; i ++) result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

		return result;
	},
	textNumber: (length: number = 4): any => {
		let result = ''
		for(let i = 0; i < length; i ++) {
			if(random.number(1) <= 5) result += num.charAt(Math.floor(Math.random() * num.length));
			else result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
		}

		return result;
	}
}
export default random