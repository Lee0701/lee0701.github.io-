
var posts = [];

var getText = function(path, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success)
					success(xhr.responseText);
			} else {
				if (error)
					error(xhr);
			}
		}
	};
	xhr.open("GET", path, true);
	xhr.send();
}

var getParam = function(param) {
	var queryString = window.location.search.substring(1);
	queryString = queryString.replace(/\+/g, "%20");
	queryString = decodeURIComponent(queryString);
	var queries = queryString.split("&");
	for(var i in queries) {
		var pair = queries[i].split("=");
		if(pair[0] == param) {
			return pair[1];
		}
	}
	return null;
}

var onSearchLoad = function() {
	var filters = [];
	var query = getParam('query');
	var orFilters = query.split(" ");
	for(var i in orFilters) {
		filters[i] = [];
		var andFilters = orFilters[i].split("+");
		for(var j in andFilters) {
			var keyValue = andFilters[j].split("::");
			if(keyValue.length == 2) {
				filters[i][j] = {
					property: keyValue[0],
					value: keyValue[1],
					match: "equals"
				};
			}
			else if((keyValue = andFilters[j].split(":")).length == 2) {
				filters[i][j] = {
					property: keyValue[0],
					value: keyValue[1],
					match: "like"
				};
			} else {
				filters[i][j] = {
					property: "title",
					value: andFilters[j],
					match: "like"
				}
			}
		}
	}
	
	getText('/search.json', function(data) {
		data = JSON.parse(data);
		posts = filterPosts(data, filters);
		if(posts.length == 0) {
			noResultsPage(query);
		} else {
			layoutResultsPage(query, posts);
		}
	});
	
}

var noResultsPage = function(query) {
	var header = document.getElementById("search-title");
	var container = document.getElementById("search-results");
	var desc = document.getElementById("search-description");
	header.innerHTML = "No Result";
	desc.innerHTML = "'" + query + "'에 대한 검색 결과가 없습니다.";
}

var layoutResultsPage = function(query, posts) {
	var header = document.getElementById("search-title");
	var container = document.getElementById("search-results");
	var desc = document.getElementById("search-description");
	header.innerHTML = "Search Result";
	desc.innerHTML = "'" + query + "'에 대한 검색 결과입니다.";
	for(var i in posts) {
		var post = posts[i];
		var li = document.createElement("li");
		li.innerHTML = ""
		+ '<a href="' + post.href + '#main">'
		+ post.title
		+ '</a>'
		+ ' <span class="date">-'
		+ post.date.day + ' ' + post.date.month + ' ' + post.date.year
		+ '</span>'
		+ '';
		container.appendChild(li);
	}
}

var filterPosts = function(posts, filters) {
	var result = [];
	
	posts.pop();
	for(var i in posts) {
		var post = posts[i];
		
		post.tags.pop();
		
		for(var f in filters) {
			var andFilters = filters[f];
			var add = true;
			for(var a in andFilters) {
				if(add == false) break;
				var filter = andFilters[a];
				var prop = post[filter.property];
				if(prop.constructor == String) {
					prop = [prop];
				}
				if(prop.length == 0) {
					add = false;
					break;
				}
				for(var j in prop) {
					var match = filter.match;
					add = false;
					if(match == "equals" && prop[j].toLowerCase() == filter.value.toLowerCase()) {
						add = true;
						break;
					}
					if(match == "like" && prop[j].toLowerCase().includes(filter.value.toLowerCase())) {
						add = true;
						break;
					}
				}
			}
			if(add) {
				result.push(post);
			}
		}
	}
	
	return result;
}

window.addEventListener('load', onSearchLoad);
