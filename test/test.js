"use strict";
var args = require('../lib/');
var chai = require("chai");
var expect = chai.expect;


describe("args test", function() {
	it("args.parse", function() {
		var opts = args.Options.parse([
			{
				name: 'xx',
				shortName: 'x'
			},
			{
				name: 'yy',
				shortName: 'y',
				type: 'bool'
			}
		]);

		//var argv = [null, null, '-x', 'y'];
		var argv = "test foo --yy --xx=bar".split(" ");

		var ACTUAL = JSON.stringify(args.parser(argv).parse(opts));
		var EXPECTED = JSON.stringify({ yy: true, xx: "bar" });
		expect(ACTUAL).to.equal(EXPECTED);
	});
});
