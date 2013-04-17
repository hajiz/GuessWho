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
		log("Going for " + url);
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
						log("Lazy Factory is calling then on " + url);
						obj.then(response);
					}
				}
			});
		}(lazy));
		return lazy;
	},
	
	groupThen: function (objs, then) {
		if (typeof objs.length !== "undefined") {
			var count = objs.length;
			var uuid = [];
			for (var i = 0; i < count; i++) {
				uuid.push(Math.random());
				log("generating id: " + uuid[i]);
			}
			var flags = {};
			for (var i = 0; i < count; i++) {
				flags[uuid[i]] = false;
			}
			var collector = {
				flags: flags,
				collect: function (uuid) {
					flags[uuid] = true;
					this.checkAll();
				},
				checkAll: function () {
					log("checking");
					var all = true;
					for (key in flags) {
						if (!flags[key]) {
							all = false;
						}
					}
					if (all) {
						log("all received, now calling then...");
						this.then(objs);
					}
				},
				then: then
			};
			for (var i = 0; i < count; i++) {
				objs[i].then = ((function (id, collector) {
					return function () {
						log("collected " + id);
						collector.collect(id);
					};
				})(uuid[i], collector));
			}
		} else if (typeof objs.then === "function") {
			objs.then = then;
		} else {
			then(objs);
		}
	}
};
