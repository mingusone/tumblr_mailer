// ALL COMMENTS REFERENCE THE LINES OF CODE BELOW IT.
// e.g. fs will be the library of 'fs' via require();
var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('x');
var WEEK = 604800;

//PARSE THE CSV FILE
var csvFile = fs.readFileSync('friend_list.csv','utf8');
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');

var csvParse = function(file){
	//Split the string by newlines. Now each line is in it's own array slot
	var fileLines = file.split('\n');
	//arrayOfFriendObjects will be returned. AKA all of the objectified friends in an array
	var arrayOfFriendObjects = [];
	//only parse if there's something actually in the file, not including the labels
	if(fileLines.length > 1){
		//Take all the labels and put them into its own array
		var labelArray = fileLines[0].split(',');
		//populate the arrayOfFriendObjectsay with the individual objects of each line (the friends)
		for (var i = 1; i < fileLines.length; i++){
			//Ignore blank lines.
			if(fileLines[i].length > 0){
				var friend = {};
				var friendInformationArr = fileLines[i].split(',')
					//Loop through each label and create attributes in the friend object respectively
					for (var x = 0; x < labelArray.length; x++) {
						var stringOfKey = labelArray[x];
						friend[stringOfKey] = friendInformationArr[x];
					}
				arrayOfFriendObjects.push(friend);				
			}			
		};
		return arrayOfFriendObjects;
	}
	//File was empty. Not quite sure what to do with this yet.
	return null;	
}

var friendList = csvParse(csvFile);

var client = tumblr.createClient({
  consumer_key: 'x',
  consumer_secret: 'x',
  token: 'x',
  token_secret: 'x'
});

var date = new Date();
var sevenDaysAgoTime = Math.floor(date.getTime()/1000) - WEEK;
var recentPosts = [];

client.posts('minglei718.tumblr.com', function(err, theBlog){
	theBlog.posts.forEach(function(post){
		if(parseInt(post.timestamp) - sevenDaysAgoTime > 0){
			post['href'] = post.post_url;
			recentPosts.push(post);
		}
	});
});


setTimeout( function(){
	friendList.forEach(function(row){
		var customizedTemplate = ejs.render(emailTemplate, {
			firstName: row.firstName,
			numMonthsSinceContact: row.numMonthsSinceContact,
			latestPosts: recentPosts
		});

		sendEmail(row.firstName, row.emailAddress, 'Ming', 'junming2002@gmail.com','test',customizedTemplate);
		console.log("Mail sent to "+row.firstName+" "+row.lastName+' at '+row.emailAddress);
	});
},1000);


//setTimeout(function(){
//console.log(recentPosts[0]);
//}, 500);

var sendEmail = function (to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }
