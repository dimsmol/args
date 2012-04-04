var errors = require('./errors');


var Args = function (argv, opt_startPos, opt_endPos) {
	this.argv = argv || process.argv;
	this.pos = opt_startPos || 0;
	this.endPos = opt_endPos || this.argv.length - 1;

	this.result = {};
	this.positional = [];
};

Args.prototype.clear = function () {
	this.result = {};
	this.positional = [];
};

Args.prototype.parseAll = function (options, opt_strict, opt_allowPositional) {
	if (opt_strict === undefined) {
		opt_strict = true;
	}

	while (this.hasMore()) {
		var arg = this.next(opt_strict);
		if (arg == null) {
			if (opt_allowPositional) {
				this.positional.push(arg.name);
			}
			else {
				throw new errors.UnexpectedPositional(this.getCurrent());
			}
		}
		else if (arg.option == null) {
			this.result[arg.name] = arg.value;
		}
	};
};

Args.prototype.hasMore = function () {
	return this.pos < this.endPos;
};

Args.prototype.getCurrent = function () {
	return this.argv[this.pos];
};

Args.prototype.skip = function () {
	this.pos++;
};

Args.prototype.next = function (options, opt_strict) {
	var arg = this.getCurrent();
	var result;
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

Args.prototype.nextFull = function (options, opt_strict) {
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

Args.prototype.nextShort = function (options, opt_strict) {
	var src = this.getCurrent();
	var opts = src.split('');
	opts.shift(); // skip starting '-'

	for (var i = 0; i < opts.length; i++) {
		var shortName = opts[i];
		var option = options.ensureOption(shortName, src, opt_strict);

		if (option == null) {
			return {
				index: i,
				shortName: shortName,
				value: value
			};
		}

		if (option.needsValue() && i != opts.length - 1) {
			throw new error.ValueRequired(option, src);
		}
	}

	this.skip();

	var result = {
		option: option,
		name: name
	};

	if (option.needsValue()) {
		if (!this.hasMore()) {
			throw new error.ValueRequired(option, src);
		}

		var value = this.getCurrent();
		result.value = this.processRawValue(option, name, value, true);
	}

	return result;
};

Args.prototype.processRawValue = function (option, name, value, consumedValueArg) {
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
		value = option.parse(value);
		if (consumedValueArg) {
			this.skip();
		}
	}

	value = this.processValue(option, value);

	return {
		option: option,
		name: name,
		value: value
	};
};

Args.prototype.processValue = function (option, value) {
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

Args.args = function (opt_argv, opt_startPos, opt_endPos) {
	return new Args(opt_argv, opt_startPos, opt_endPos);
};


module.exports = Args;
