var inherits = require('util').inherits;


var ParseError = function (opt_src, opt_option) {
	this.src = opt_src;
	this.option = opt_option;

	this.message = this.getMessage();
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
};
inherits(ParseError, Error);

ParseError.prototype.name = 'ParseError';

ParseError.prototype.getMessage = function (arr) {
	var result = this.getMessageHead();
	this.appendArgument(result);
	this.appendSrc(result);
	this.appendMessageTail(result);
	return result.join('');
};

ParseError.prototype.appendMessageTail = function (arr) {
};

ParseError.prototype.getMessageHead = function () {
	return ['Generic error'];
};

ParseError.prototype.appendArgument = function (arr) {
	if (this.option) {
		arr.push(' for argument "');
		arr.push(this.option.getName());
		arr.push('"');
	}
};

ParseError.prototype.appendSrc = function (arr) {
	if (this.src) {
		arr.push(' provided as "');
		arr.push(this.src);
		arr.push('"');
	}
};


var BadValue = function (option, value, src) {
	this.value = value;

	ParseError.call(this, src, option);
};
inherits(BadValue, ParseError);

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
	ParseError.call(this, src, option);
};
inherits(UnexpectedValue, ParseError);

UnexpectedValue.prototype.name = 'UnexpectedValue';

UnexpectedValue.prototype.getMessageHead = function () {
	return ['Unexpected value'];
};


var ValueRequired = function (option, src) {
	ParseError.call(this, src, option);
};
inherits(ValueRequired, ParseError);

ValueRequired.prototype.name = 'ValueRequired';

ValueRequired.prototype.getMessageHead = function () {
	return ['Value required'];
};

var UnexpectedPositional = function (src) {
	ParseError.call(this, src);
};
inherits(UnexpectedPositional, ParseError);

UnexpectedPositional.prototype.name = 'UnexpectedPositional';

UnexpectedPositional.prototype.getMessage = function () {
	return [
		'Unexpected positional argument "',
			this.src, '"'].join('');
};

var UnknownArg = function (arg, src) {
	this.arg = arg;

	ParseError.call(this, src);
};
inherits(UnknownArg, ParseError);

UnknownArg.prototype.name = 'UnknownArg';

UnknownArg.prototype.getMessage = function () {
	return [
		'Unknown argument "', this.arg, '"'].join('');
};


var ArgumentRequired = function (option) {
	ParseError.call(this, null, option);
};
inherits(ArgumentRequired, ParseError);

ArgumentRequired.prototype.name = 'ArgumentRequired';

ArgumentRequired.prototype.getMessage = function () {
	return [
		'Argument "',
			this.option.getName(),
		'" is required'].join('');
};


module.exports = {
	ParseError: ParseError,
	BadValue: BadValue,
	ValueRequired: ValueRequired,
	UnexpectedPositional: UnexpectedPositional,
	UnknownArg: UnknownArg,
	ArgumentRequired: ArgumentRequired
};
