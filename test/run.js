var Mocha = require("mocha");


var mocha = new Mocha({
	ui: "bdd",
	reporter: "spec",
	timeout: 100000
});

mocha.addFile(require.resolve("./test"))

mocha.run(function(err) {
	process.exit(err)
});
