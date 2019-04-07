
const fs = require('fs');
const fetch = require('node-fetch');

const getDocs = async (key, format, suffix) => {

	let uri = 'https://spreadsheets.google.com/feeds/list/' + key + '/od6/public/values?alt=json-in-script';
	
	const response = await fetch(uri);
	let data = await response.text();
	
	data = data.substring(data.indexOf("(") + 1);
	data = data.substring(0, data.lastIndexOf(")"));
	
	const json = JSON.parse(data);
	
	let output = {};
	
	json.feed.entry.forEach(v => {
		if (v["gsx$state"]["$t"] !== "OK") return;
		
		let keys = Object.keys(v).filter(v => v.indexOf("gsx$") === 0).map(v => v.substring(4));
		let langs = keys.filter(v => ["code", "state"].indexOf(v) === -1);
		
		langs.forEach(key => {
			if (!output[key]) output[key] = {};
			output[key][v["gsx$code"]["$t"]] = v["gsx$" + key]["$t"]; 
		});
	});
	
	
	Object.keys(output).forEach(language => {
		let response;
		if (format == 'json') {
			response = JSON.stringify(output[language], null, 4);
		}
		else if (format == 'properties') {
			response = Object.keys(output[language]).map(item => {
				return item + " = " + output[language][item];
			}).join("\n");
		}
		
		fs.writeFile(suffix + language + '.' + format, response, 'utf8', function(err) {
			console.log('Write a file! ' + suffix + language + '.' + format);
		});
	});

};

if (process.argv.length <= 3) {
	console. log("Usage: " + __filename + " [Google Docs ID] [format(json/properties)] [suffix]");
	process. exit(-1);
}

getDocs(process.argv[2], process.argv[3], process.argv.length <= 4 ? '' : process.argv[4]);




/*
let key = '12yi-8hW8oMKEOZl4cP0cc2z9CYo9Ji0FXD9pKxibKiE';
let format = 'properties';
let suffix = 'default_';
*/