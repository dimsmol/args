var errors = require('./errors');


var Option = require('./option');

var Options = function () {
	this.options = [];
};

Options.prototype.applyDefaults = function (result) {
	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		if (option.defaultValue && !(option.key in result)) {
			result[option.key] = option.parsedDefaultValue;
		}
	};
};

Options.prototype.getUnmetRequirements = function (result, maxCount) {
	var unmet = [];
	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		if (option.required && !(option.key in result)) {
			unmet.push(option);
			if (maxCount != null && unmet.length >= maxCount) {
				break;
			}
		}
	};

	return unmet;
};

Options.prototype.getHelp = function (prefix) {
	var result = [];

	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];

		result.push(prefix);
		result.push(option.getHelp());
		result.push('\n');
	};

	return result.join('');
};

Options.prototype.parse = function (options) {
	for (var i = 0; i < options.length; i++) {
		this.options.push(this.getParsedOption(options[i]));
	};
};

Options.prototype.getParsedOption = function (option) {
	if (option instanceof Option) {
		return option;
	}

	return Option.parse(option);
};

Options.prototype.ensureOption = function (name, src, opt_strict) {
	var result = this.getOption(name);
	if (opt_strict && result == null) {
		throw new errors.UnknownArg(name, src);
	}
	return result;
};

Options.prototype.getOption = function (name) {
	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		if (option.matches(name)) {
			return option;
		}
	}
	return null;
};

Options.parse = function (options) {
	var instance = new Options();
	instance.parse(options);
	return instance;
};


module.exports = Options;
