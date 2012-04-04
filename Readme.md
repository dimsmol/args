## args

`args` is command line arguments parser for node.js

Instead of trying to deal with all your complex cases, `args` provides a toolset to help you with arguments parsing.

## option properties

* `name`
* `shortName`
* `key`
* `type`
* `isList`
* `enumItems`
* `custom`
	* `check`
	* `parse`
	* `tryParse`
	* `get`
* `help`

## usage example

```js
var options = Options.parse([
	{
		name: 'option',
		shortName: 'o',
		type: 'int',
		help: 'some option'
	}
]);

options.getHelp();

var parsed = args('node app.js --option 11', 2).parseAll(options);
console.log(parsed); // {option: 11}
```
