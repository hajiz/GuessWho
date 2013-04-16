var DEBUG = 1, RUN = 2;
var mode = DEBUG;

var config = {
		maxDelay: 1000
};

function log (value) {
	if (mode === DEBUG)
		console.log(value);
}

function LazyObject () {
	this.data = {};
	
	this.inProgress = {
		message: "Still in progress"	
	};
	
	this.failed = {
		message: "Failed"
	};
	
	this.completed = {
		message: "Completed"
	};
		
	this.status = this.inProgress;
	
	this.get = function (index) {
		var t1 = (new Date()).getTime();
		if (typeof this.data[index] === "undefined") {
			while (typeof this.data[index] === "undefined") {
				if (new Date().getTime() - t1 > config.maxDelay) {
					break;
				}
			}
			if (typeof this.data[index] === "undefined") {
				log("Timeout");
				return this.inProgress;
			} else {
				log("OK");
				return this.data[index];
			}
		} else {
			log("OK");
			return this.data[index];
		}
	};
	
	this.then = function (func) {
		if (typeof func === "function") {
			if (this.status === this.completed) {
				func(this.data);
			}
		}
	};
}

var LazyFactory = {
	fetch : function (url, method, params) {
		var lazy = new LazyObject();
		(function (obj) {
			FB.api(url, method, params, function(response) {
				if (response.error) {
					obj.status = obj.failed;
				} else {
					response = response.data;
					obj.data = response;
					obj.status = obj.completed;
					if (typeof obj.then === "function") {
						obj.then(response);
					}
				}
			});
		}(lazy));
		return lazy;
	}
};