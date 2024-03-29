var Person = function (id) {
	if (typeof id === "undefined")
		id = "me";
	this.id = id;
	
	this.recentPosts = function (count) {
		count = count || 3;
		var lazyArray = LazyFactory.fetch('/'+this.id+'/posts', { limit : count });
		return lazyArray;
	};
	
	this.getFriends = function () {
		return LazyFactory.fetch('/'+this.id+'/friends');
	};
	
	this.getLinks = function () {
		return LazyFactory.fetch('/'+this.id+'/links?fields=message,link,name,created_time');
	};
	
	this.getStatuses = function () {
		return LazyFactory.fetch('/'+this.id+'/statuses?fields=message,updated_time');
	};
}