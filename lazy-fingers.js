(function(window, undefined) {
	var LazyFingers = window.LazyFingers = function(options) {
		options = options || {};

		this.options = {
			idAttribute: options.idAttribute || 'id',
			indexAttribute: options.indexAttribute || 'name'
		};

		this._index = [];
		this._documentsById = {};
	};

	LazyFingers.fn = LazyFingers.prototype;

	LazyFingers.fn.add = function(docs) {
		var docsIndex = 0;
		var docsLength = docs.length;
		var indexAttribute = this.options.indexAttribute;
		var idAttribute = this.options.idAttribute;
		var doc;
		var docData;
		var docsById = this._documentsById;
		var index = this._index;

		//Iterate over all documents we want to add to the index.
		for(; docsIndex < docsLength; docsIndex++) {
			doc = docs[docsIndex];
			docData = doc[indexAttribute];

			docsById[doc[idAttribute]] = doc;

			//Does the document have any data to index?
			if(docData === undefined || docData === null) {
				continue;
			}

			docData = ('' + docData).toLowerCase();

			index.push({
				data: docData,
				doc: doc
			});
		}
	};

	LazyFingers.fn.find = function(input) {
		input = input.replace(/\s+/g, '').toLowerCase();

		if(!input.length) {
			return [];
		}

		input = escapeRegExp(input);

		var rx = new RegExp('(' + input.split('').join(').*(') + ')');
		var results = [];
		var index = this._index;
		var indexIndex = 0;
		var indexLength = index.length;
		var indexEntry;
		var indexEntryData;
		var isMatch;
		var matchedPositions;
		var argumentsIndex;
		var argumentsLength;
		var character;
		var characterIndex ;

		for(; indexIndex < indexLength; indexIndex++) {
			indexEntry = index[indexIndex];
			indexEntryData = indexEntry.data;

			isMatch = false;

			indexEntryData.replace(rx, function() {
				isMatch = true;

				matchedPositions = [];

				argumentsIndex = 1;
				//-3 because we only want the group, not the full string or the index.
				argumentsLength = arguments.length - 2;

				characterIndex = 0;

				for(; argumentsIndex < argumentsLength; argumentsIndex++) {
					character = arguments[argumentsIndex];
					characterIndex = indexEntryData.indexOf(character, characterIndex);
					matchedPositions.push(characterIndex);
					characterIndex++;
				}
			});

			if(isMatch) {
				results.push({
					doc: indexEntry.doc,
					positions: matchedPositions
				});
			}
		}

		return results;
	};

	LazyFingers.wrap = function(input, positions, fn) {
		var inputIndex = 0;
		var inputLength = input.length;
		var offset = 0;
		var replacementString;
		var positionsIndex = 0;
		var positionsLength = positions.length;
		var index;

		for(; positionsIndex < positionsLength; positionsIndex++) {
			index = positions[positionsIndex] + offset;
			replacementString = fn(input.charAt(index));

			input = input.slice(0, index) + replacementString + input.slice(index + 1);

			offset += replacementString.length - 1;
		}

		return input;
	};

	var escapeRegExp = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	};
}(window));