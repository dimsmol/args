**WARNING** Not actively supported! Please, consider switching to some other lib.

**WARNING** npm package [args](https://www.npmjs.com/package/args) was used for this project only for versions <= `0.0.3`. Ownership then have been transferred to [leo](https://www.npmjs.com/~leo) to reuse `args` npm package name for other arguments parsing library.

## args

`args` is command line arguments parser for node.js

Instead of trying to deal with all your complex cases, `args` provides a tool to help you with arguments parsing.

## features

Supported syntax for options: `--option=value`, `--option value`, `-abc`, `-abc value`

For boolean flags, `true` value can be omitted, i.g. `-f true` can be replaced with `-f` (and `--flag true` with `--flag` also).

## option properties

* name
* shortName
* key
* type
	* `no value` - str
	* enum
	* bool
	* int
	* float
	* date
	* datetime
* isList
* enumItems
* enumHelp
* required
* defaultValue
* help

## usage example

```js
var args = require('args');

var options = args.Options.parse([
	{
		name: 'option',
		shortName: 'o',
		type: 'int',
		help: 'some option'
	}
]);

console.log(options.getHelp()); // shows help

var argv = 'node app.js --option 11'.split(' ');
var parsed = args.parser(argv).parse(options);
console.log(parsed); // {option: 11}
```

## License

MIT
