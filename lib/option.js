var errors = require('./errors');


var Option = function () {
	this.name = null;
	this.shortName = null;
	this.key = null;
	this.type = null;
	this.isList = false;
	this.enumItems = null;

	this.custom = {
		tryParse: null, // bool specific
		get: null, // bool specific
		check: null,
		parse: null
	};

	this.help = null;
};

Option.prototype.getHelp = function () {
	var result = [];
	if (this.name) {
		result.push('--');
		result.push(this.name);
	}
	if (this.shortName) {
		if (this.name) {
			result.push(', ');
		}
		result.push('-');
		result.push(this.shortName);
	}
	result.push('\t');
	if (this.help) {
		result.push(this.help);
	}
	var typeInfo = this.getTypeInfo();
	if (typeInfo) {
		if (this.help) {
			result.push(' (');
		}
		result.push(typeInfo);
		if (this.help) {
			result.push(')');
		}
	}
	return result.join('');
};

Option.prototype.getTypeInfo = function () {
	switch (this.type) {
		case 'enum':
			return 'one of ' + this.enumItems.join(', ');
		case 'bool':
			return '"true" or "false"';
		case 'int':
			return 'integer';
		case 'float':
			return 'decimal';
		case 'date':
			return 'date';
		case 'datetime':
			return 'datetime';
	};
	return '';
};

Option.prototype.parse = function (optionInfo) {
	this.name = optionInfo.name;
	this.shortName = optionInfo.shortName;
	this.key = optionInfo.key;
	this.type = optionInfo.type;
	this.isList = optionInfo.isList === undefined ? this.isList : !!optionInfo.isList;
	this.enumItems = optionInfo.enumItems;
	this.custom = optionInfo.custom || this.custom;

	this.help = optionInfo.help;

	if (this.key == null) {
		this.key = this.name;
	};

	if (this.key == null) {
		throw new Error('Option must have "name" or "key" property set');
	}
	if (this.name == null && this.shortName == null) {
		throw new Error('Option must have "name" or "shortName" property set');
	}
};

Option.prototype.matches = function (name) {
	if (!name) {
		return false;
	}
	if (this.name == name) {
		return true;
	}
	if (this.shortName == name) {
		return true;
	}
	return this.isBool() && this.isInversed(name) && this.getUninversed(name) == this.name;
};

Option.prototype.ensureNeedsValue = function (name, src) {
	if (!this.needsValue(name)) {
		throw new errors.UnexpectedValue(this, src);
	}
};

Option.prototype.needsValue = function (name) {
	return !this.isBool() || !this.isInversed(name);
};

Option.prototype.isInversed = function (name) {
	return name.indexOf('no-') == 0;
};

Option.prototype.getUninversed = function (name) {
	return name.substr(3);
};

Option.prototype.isBool = function () {
	return this.type == 'bool';
};

Option.prototype.tryParseBool = function (value) {
	if (this.custom.tryParse) {
		return this.custom.tryParse(value);
	}

	var result;
	if (value == 'true') {
		result = true;
	}
	else if (value == 'false') {
		result = false;
	}
	return result;
};

Option.prototype.parseBool = function (value, src) {
	var result = this.tryParseBool(value);
	if (result === undefined) {
		throw new error.BadValue(this, value, src);
	}
};

Option.prototype.getBool = function (name) {
	if (this.custom.get) {
		return this.custom.get(value);
	}

	if (this.isInversed(name)) {
		return false;
	}
	return true;
};

Option.prototype.getCheckRe = function () {
	var checkRe = {
		'int': /^-?\d+$/,
		'float': /^-?\d+(\.\d+)?$/ // TODO alow exponential form
		// TODO checks for 'date' & 'datetime'
	};
	return checkRe[this.type];
};

Option.prototype.check = function (value, src) {
	if (this.custom.check) {
		return this.custom.check(value, src);
	}

	if (this.type == 'enum') {
		if (this.enumItems.indexOf(value) == -1)
		{
			throw new error.BadValue(this, value, src);
		}
	}

	var re = this.getCheckRe();
	if (re != null && !re.test(value)) {
		throw new error.BadValue(this, value, src);
	}

	return value;
};

Option.prototype.parse = function (value, src) {
	if (this.custom.parse) {
		return this.custom.parse(value, src);
	}

	value = this.check(value, src);

	switch (this.type) {
		case 'bool':
			return this.parseBool(value, src);
		case 'int':
			return parseInt(value, 10);
		case 'float':
			return parseFloat(value);
		case 'date':
		case 'datetime':
			return new Date(value);
	};
	return value;
};

Option.parse = function (option) {
	var instance = new Option();
	instance.parse(option);
	return instance;
};


module.exports = Option;
