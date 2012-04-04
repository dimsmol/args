var inherits = require('util').inherits;


var ArgsError = function (opt_src, opt_option) {
	this.src = opt_src;
	this.option = opt_option;

	this.message = this.getMessage();
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
};
inherits(ArgsError, Error);

ArgsError.prototype.name = 'ArgsError';

ArgsError.prototype.getMessage = function (arr) {
	var result = this.getMessageHead();
	this.appendArgument(result);
	this.appendSrc(result);
	this.appendMessageTail(result);
	return result.join('');
};

ArgsError.prototype.appendMessageTail = function (arr) {
};

ArgsError.prototype.getMessageHead = function () {
	return ['Generic error'];
};

ArgsError.prototype.appendArgument = function (arr) {
	if (this.option) {
		arr.push(' for argument "');
		arr.push(this.option.name);
		arr.push('"');
	}
};

ArgsError.prototype.appendSrc = function (arr) {
	if (this.src) {
		arr.push(' provided as "');
		arr.push(this.src);
		arr.push('"');
	}
};


var BadValue = function (option, value, src) {
	this.value = value;

	ArgsError.call(this, src, option);
};
inherits(BadValue, ArgsError);

BadValue.prototype.name = 'BadValue';

BadValue.prototype.getMessageHead = function () {
	return ['Bad value "', this.value, '"'];
};

BadValue.prototype.appendMessageTail = function () {
	var typeInfo = this.option.getTypeInfo();
	if (typeInfo) {
		result.push(' - must be ');
		result.push(typeInfo);
	}
};


var UnexpectedValue = function (option, src) {
	ArgsError.call(this, src, option);
};
inherits(UnexpectedValue, ArgsError);

UnexpectedValue.prototype.name = 'UnexpectedValue';

UnexpectedValue.prototype.getMessageHead = function () {
	return ['Unexpected value'];
};


var ValueRequired = function (option, src) {
	this.option = option;
	this.src = src;

	ArgsError.call(this);
};
inherits(ValueRequired, ArgsError);

ValueRequired.prototype.name = 'ValueRequired';

ValueRequired.prototype.getMessage = function () {
	return [
		'Value required for argument "',
			this.option.name,
		'" (provided as "',
			this.src, '")'].join('');
};

var UnexpectedPositional = function (src) {
	ArgsError.call(this, src);
};
inherits(UnexpectedPositional, ArgsError);

UnexpectedPositional.prototype.name = 'UnexpectedPositional';

UnexpectedPositional.prototype.getMessage = function () {
	return [
		'Unexpected positional argument "',
			this.arg, '"'].join('');
};

var UnknownArg = function (arg, src) {
	this.arg = arg;

	ArgsError.call(this, src);
};
inherits(UnknownArg, ArgsError);

UnknownArg.prototype.name = 'UnknownArg';

UnknownArg.prototype.getMessage = function () {
	return [
		'Unknown argument "', this.arg, '"'].join('');
};


module.exports = {
	ArgsError: ArgsError,
	BadValue: BadValue,
	ValueRequired: ValueRequired,
	UnknownType: UnknownType,
	UnexpectedPositional: UnexpectedPositional,
	UnknownArg: UnknownArg
};
