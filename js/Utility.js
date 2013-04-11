var DEBUG = 1, RUN = 2;
var mode = DEBUG;

var config = {
		maxDelay: 1000
};

function log (value) {
	if (mode === DEBUG)
		console.log(value);
}

function LazyArray () {
	this.data = [];
	
	this.get = function (index) {
		var t1 = (new Date()).getTime();
		if (this.data.length === undefined) {
			log("Length undefined");
			return null;
		}
		if (this.data.length !== undefined && this.data.length < index+1) {
			while (this.data.length < index+1) {
				if (new Date().getTime() - t1 > config.maxDelay) {
					break;
				}
			}
			if (this.data.length === undefined || this.data.length < index+1) {
				log("Timeout");
				return null;
			} else {
				log("OK");
				return this.data[index];
			}
		} else {
			log("OK");
			return this.data[index];
		}
	};
}

var LazyFactory = {
	fetch : function (url, method, params) {
		var lazyArray = new LazyArray();
		(function (obj) {
			FB.api(url, method, params, function(response) {
			  response = response.data;
			  obj.data = response;
			});
		}(lazyArray));
		return lazyArray;
	}
};