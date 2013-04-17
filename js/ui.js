var game = {
	score : 0,
	nextScore : 0,
	scored : function () {
		this.score += this.nextScore;
		$("#score").html(this.score);
	}
};

function loadFriends() {
	var me = new Person('me');
	var friends = me.getFriends();
	var list = $("#list");
	friends.then = function (data) {
		$("#load").hide();
		$("#start").removeAttr("disabled");
		window.friends = friends;
		next();
		var names = [];
		for (var i = 0; i < friends.data.length; i++)
			names.push(friends.data[i].name);
		$("#guess").typeahead({ source: names });
	};
}

function next() {
	var friends = window.friends;
	var count = friends.data.length;
	var rand = parseInt(Math.random() * count);
	window.friend = friends.get(rand);
}

function retrieve(id) {
	var friend = new Person(id);
	var posts = friend.getStatuses();
	var links = friend.getLinks();
	var statusTemplate = "<a class='post' href='http://facebook.com/{id}'><div class='post-container'>{created_time}: {message}</div></a>";
	var linkTemplate = "<a class='post' href='http://facebook.com/{id}'><div class='post-container'>{created_time}: {message}<br><a href='{link}'>{link}</a></div></a>";
	var list = $("#list");
	var status = $("#status");
	list.html("");
	LazyFactory.groupThen([posts,links], function (all) {
		var totalPosts = all[0].data.length;
		var totalLinks = all[1].data.length;
		var totalShown = 0;
		if (totalPosts + totalLinks === 0) {
			next();
			start();
			return;
		}
		$("#guessbtn").removeAttr("disabled");
		var count = 3;
		var data = all[0].data;
		for (key in data) {
			if (Math.random() < 1) {
				if (typeof data[key].message === "undefined") {
					continue;
				}
				totalShown++;
				list.append(statusTemplate
						.replace(/{message}/g,data[key].message)
						.replace(/{id}/g,data[key].id)
						.replace(/{created_time}/g,new Date(data[key].updated_time).toDateString())
						);
				count -= 1;
				if (!count) {
					break;
				}
			}
		}
		
		count = 3;
		data = all[1].data;
		for (key in data) {
			if (data[key].link[0] === '/')
				data[key].link = "http://www.facebook.com" + data[key].link;
			if (typeof data[key].name === "undefined")
				data[key].name = "";
			if (typeof data[key].message === "undefined")
				data[key].message = "";
			if (Math.random() < 1) {
				totalShown++;
				list.append(linkTemplate
						.replace(/{message}/g,data[key].message)
						.replace(/{id}/g,data[key].id)
						.replace(/{link}/g,data[key].link)
						.replace(/{name}/g,data[key].name)
						.replace(/{created_time}/g,new Date(data[key].created_time).toDateString())
						);
				count -= 1;
				if (!count) {
					break;
				}
			}
		}
		game.nextScore = (totalShown*200) / (totalPosts+totalLinks);
		game.nextScore = 10 + parseInt(game.nextScore / 10) * 10;
	});
}

function start() {
	log("showing : " + window.friend.name);
	$("#start").hide();
	$("#next").show().removeAttr("disabled");
	$("#guessbtn").show().attr("disabled", true);
	retrieve(window.friend.id);
}

var statusTimeout;
function guess() {
	var guess = $("#guess");
	var status = $("#status");
	if (guess.val() === window.friend.name) {
		game.scored();
		status.html("Yaaaaaaaay!! Now next...");
		clearTimeout(statusTimeout);
		statusTimeout = setTimeout("$('#status').html('')", 2000);
		next();
		start();
	} else {
		status.html("Not quite right... try again!");
		clearTimeout(statusTimeout);
		statusTimeout = setTimeout("$('#status').html('')", 2000);
	}
	guess.val("");
}

function giveUp() {
	var status = $("#status");
	next();
	start();
	status.html("That's fine, guess this fine");
}

function login() {
	FB.login(function(response) {
		if (response.authResponse) {
			log('Welcome!  Fetching your information.... ');
			FB.api('/me', function(response) {
				log('Good to see you, ' + response.name + '.');
			});
			loadFriends();
		} else {
			log('User cancelled login or did not fully authorize.');
		}
	}, { scope: 'read_stream friends_status' });
}
