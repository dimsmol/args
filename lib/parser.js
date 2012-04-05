"use strict";
var errors = require('./errors');


var Parser = function (argv, opt_startPos, opt_endPos) {
	this.argv = argv || process.argv;
	this.pos = opt_startPos || 0;
	this.endPos = opt_endPos || this.argv.length - 1;

	this.result = {};
	this.positional = [];
};

Parser.prototype.clear = function () {
	this.result = {};
	this.positional = [];
};

Parser.prototype.parse = function (options, opt_strict, opt_allowPositional) {
	if (opt_strict === undefined) {
		opt_strict = true;
	}

	while (this.hasMore()) {
		var arg = this.next(options, opt_strict);
		if (arg == null) {
			if (opt_allowPositional) {
				this.positional.push(arg.name);
			}
			else {
				throw new errors.UnexpectedPositional(this.getCurrent());
			}
		}
		else {
			this.addToResult(arg);
		}
	};
};

Parser.prototype.parseToPositional = function (options, opt_strict) {
	if (opt_strict === undefined) {
		opt_strict = true;
	}

	while (this.hasMore()) {
		var arg = this.next(options, opt_strict);
		if (arg == null) {
			break;
		}
		else {
			this.addToResult(arg);
		}
	};
};

Parser.prototype.addToResult = function (arg) {
	if (arg.option == null) {
		this.result[arg.name] = arg.value;
	}
	else {
		this.result[arg.option.key] = arg.value;
	}
};

Parser.prototype.prepareResult = function (options) {
	var unmet = options.getUnmetRequirements(this.result, 1)[0];
	if (unmet) {
		throw new errors.ArgumentRequired(unmet);
	}
	options.applyDefaults(this.result);
	return this.result;
};

Parser.prototype.hasMore = function () {
	return this.pos <= this.endPos;
};

Parser.prototype.getCurrent = function () {
	return this.argv[this.pos];
};

Parser.prototype.skip = function () {
	this.pos++;
};

Parser.prototype.nextRaw = function () {
	var result = this.getCurrent();
	this.skip();
	return result;
};

Parser.prototype.getRest = function () {
	return this.argv.slice(this.pos);
};

Parser.prototype.next = function (options, opt_strict) {
	var result;
	var arg = this.getCurrent();
	if (arg[0] == '-') {
		if (arg[1] == '-') {
			result = this.nextFull(options, opt_strict);
		}
		else {
			result = this.nextShort(options, opt_strict);
		}
	}

	return result;
};

Parser.prototype.nextFull = function (options, opt_strict) {
	var src = this.getCurrent();
	var name = src.substr(2);
	var value;
	var gotValue = false;
	var pos = name.indexOf('=');
	if (pos != -1) {
		gotValue = true;
		var tmp = name;
		name = tmp.substr(0, pos);
		value = tmp.substr(pos + 1);
	}

	var option = options.ensureOption(name, src, opt_strict);

	if (option == null) {
		this.skip();
		return {
			name: name,
			value: value
		};
	}

	if (gotValue) {
		option.ensureNeedsValue(option, src);
	}

	this.skip();

	var consumedValueArg = false;
	if (!gotValue && option.needsValue()) {
		if (!this.hasMore()) {
			throw new error.ValueRequired(option, src);
		}

		value = this.getCurrent();
		consumedValueArg = true;
		gotValue = true;
	}

	var result = {
		option: option,
		name: name
	};

	if (gotValue) {
		result.value = this.processRawValue(option, name, value, consumedValueArg);
	}

	return result;
};

Parser.prototype.nextShort = function (options, opt_strict) {
	var src = this.getCurrent();
	var opts = src.split('');
	opts.shift(); // skip starting '-'

	var name;
	for (var i = 0; i < opts.length; i++) {
		name = opts[i];
		var option = options.ensureOption(name, src, opt_strict);

		if (option == null) {
			return {
				index: i,
				name: name,
				value: value
			};
		}

		if (option.needsValue() && !option.isBool() && i != opts.length - 1) {
			throw new error.ValueRequired(option, src);
		}
	}

	this.skip();

	var result = {
		option: option,
		name: name
	};

	if (option.needsValue()) {
		if (!this.hasMore() && !option.isBool()) {
			throw new errors.ValueRequired(option, src);
		}

		var value = this.getCurrent();
		result.value = this.processRawValue(option, name, value, true);
	}

	return result;
};

Parser.prototype.nextValue = function (option) {
	return this.processRawValue(option, null, this.getCurrent(), true);
};

Parser.prototype.processRawValue = function (option, name, value, consumedValueArg) {
	if (consumedValueArg && option.isBool()) {
		value = option.tryParseBool(value);
		if (value === undefined) {
			value = option.getBool(name);
		}
		else {
			this.skip();
		}
	}
	else {
		value = option.parseValue(value);
		if (consumedValueArg) {
			this.skip();
		}
	}

	value = this.processValue(option, value);

	return value;
};

Parser.prototype.processValue = function (option, value) {
	if (option.isList) {
		var l = this.result[option.key];
		if (l == null) {
			l = [value];
			this.result[option.key] = l;
		}
		else {
			this.result[option.key] = value;
		}
	}

	return value;
};


module.exports = Parser;
