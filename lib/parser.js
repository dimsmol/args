"use strict";
var errors = require('./errors');


var Parser = function (argv, opt_startPos, opt_endPos, opt_subPos) {
	this.argv = argv || process.argv;
	this.pos = opt_startPos || 0;
	this.endPos = opt_endPos || this.argv.length - 1;
	this.subPos = opt_subPos || 0;

	this.result = {};
	this.positional = [];
};

Parser.prototype.clear = function () {
	this.result = {};
	this.positional = [];
};

Parser.prototype.parse = function (options, opt_onUnknown, opt_onPositional) {
	opt_onUnknown = opt_onUnknown || 'error';
	opt_onPositional = opt_onPositional || 'error';

	mainLoop:
	while (this.hasMore()) {
		var optionInfo = this.nextOption(options);
		if (optionInfo == null) {
			switch (opt_onPositional) {
				case 'error':
					throw new errors.UnexpectedPositional(this.getCurrent());
				case 'stop':
					break mainLoop;
			}
			var arg = this.getCurrent();
			this.skip();
			this.processPositional(arg);
		}
		else {
			if (optionInfo.option == null) {
				switch (opt_onUnknown) {
					case 'error':
						throw new errors.UnknownArg(optionInfo.name, optionInfo.src);
					case 'stop':
						break mainLoop;
				}
				this.skip();
			}
			this.processOption(optionInfo);
		}
	}
};

Parser.prototype.parseToPositional = function (options, opt_onUnknown) {
	return this.parse(options, opt_onUnknown, 'stop');
};

Parser.prototype.processPositional = function (arg) {
	this.positional.push(arg);
};

Parser.prototype.processOption = function (optionInfo) {
	var option = optionInfo.option;
	var value = optionInfo.value;
	if (option == null) {
		this.result[optionInfo.name] = value;
	}
	else {
		if (option.isList) {
			var l = this.result[option.key];
			if (l == null) {
				l = [value];
				this.result[option.key] = l;
			}
			else {
				l.push(value);
			}
		}
		else {
			this.result[option.key] = value;
		}
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

Parser.prototype.getRest = function () {
	return this.argv.slice(this.pos);
};

Parser.prototype.hasMore = function () {
	return this.pos <= this.endPos;
};

Parser.prototype.hasMoreSub = function () {
	var src = this.getCurrent();
	return this.subPos + 1 < src.length - 1;
};

Parser.prototype.isInSub = function () {
	return this.subPos > 0;
};

Parser.prototype.hasNextValue = function () {
	if (this.isInSub()) {
		return false;
	}
	return this.hasMore();
};

Parser.prototype.getCurrent = function () {
	return this.argv[this.pos];
};

Parser.prototype.skip = function () {
	if (this.isShort() && this.hasMoreSub()) {
		this.subPos++;
	}
	else {
		this.skipFull();
	}
};

Parser.prototype.skipFull = function () {
	this.subPos = 0;
	this.pos++;
};

Parser.prototype.getShort = function (src, subPos) {
	subPos = subPos || 0;
	return src[1+subPos];
};

Parser.prototype.getFull = function (src) {
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

	return {
		name: name,
		value: value
	};
};

Parser.prototype.isOption = function (src) {
	src = src || this.getCurrent();
	return src[0] == '-';
};

Parser.prototype.isShort = function (src) {
	src = src || this.getCurrent();
	return this.isOption(src) && src[1] && src[1] != '-';
};

Parser.prototype.nextRaw = function () {
	var result = this.getCurrent();
	this.skipFull();
	return result;
};

Parser.prototype.nextOption = function (options) {
	var src = this.getCurrent();
	if (!this.isOption(src)) {
		return null;
	}
	var name, value, gotValue = false;
	var isShort = this.isShort(src);
	if (isShort) {
		name = this.getShort(src);
	}
	else {
		var nameAndValue = this.getFull(src);
		name = nameAndValue.name;
		value = nameAndValue.value;
	}

	var result = {
		name: name,
		isShort: isShort,
		src: src
	};

	var option = options.getOption(name, isShort, src);
	if (option == null) {
		result.value = value;
	}
	else {
		result.option = option;

		if (value && !option.allowsValue()) {
			throw new errors.UnexpectedValue(option, src);
		}

		this.skip();

		if (value) {
			result.value = option.parseValue(value, src);
		}
		else if (option.allowsValue()) {
			result.value = this.nextValue(option, src);
		}
	}

	return result;
};

Parser.prototype.nextValue = function (option, src) {
	var result;
	if (option.allowsValue()) {
		if (option.requiresValue() && !this.hasNextValue()) {
			throw new errors.ValueRequired(option, src);
		}
		var value = this.getCurrent();
		if (!option.requiresValue() && !option.isValidValue(value)) {
			result = option.getNoValue();
		}
		else {
			result = option.parseValue(value, src);
			this.skip();
		}
	}
	return result;
};


module.exports = Parser;
