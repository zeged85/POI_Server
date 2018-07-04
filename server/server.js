//this is only an example, handling everything is yours responsibilty !
var jwt = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var util = require('util')
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');


app.set('superSecret', '1234');


var questions = ["what is your pet's name?", "what is your mother's maiden name?", "what is your favorite food?"];



var fs = require('fs');
xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xml = fs.readFileSync('./countries.xml').toString();

//console.log(xml);

//var user;
//var token;


app.set('superSecret', '1234');



app.use('/', function (req, res, next) {
    console.log('inside use /');


    var str = util.format("select * from POIs;");
    DButilsAzure.execQuery(str)
        .then(function (result) {
           POIs = result;
           console.log(POIs)
        })
        .catch(function(err){
            //cant find poi_of_user
            //console.log(err)
        })


    token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: "fail" });
            }
            else {
                console.log('token ok');
                //req.decoded = decoded; // decoded.payload , decoded.header
                var username = decoded.userName;
                var str = util.format("select * from Users where username = '%s';", username);
                DButilsAzure.execQuery(str)
                    .then(function (result) {
                        console.log("creating user object");
                        var username = result[0]['username'];
                        var password = result[0]['password'];
                        var firstname = result[0]['firstname'];
                        var lastname = result[0]['lastname'];
                        var email = result[0]['email'];
                        var country = result[0]['country'];
                        //var question = result[0]['question'];
                        var answer1 = result[0]['answer1'];
                        var answer2 = result[0]['answer2'];
                        var answer3 = result[0]['answer3'];
                        var category1 = result[0]['category1'];
                        var category2 = result[0]['category2'];
                        var category3 = result[0]['category3'];
                        var category4 = result[0]['category4'];

                        user = {
                            username: username,
                            password: password,
                            firstname: firstname,
                            lastname: lastname,
                            Country: country,
                            answer1: answer1,
                            answer2: answer2,
                            answer3: answer3,
                            category1: category1,
                            category2: category2,
                            category3: category3,
                            category4: category4
                        }


                        //add SQL query - get poi_of_user
                        
                        var str = "select * from POI_of_" + user.username +";"
                        DButilsAzure.execQuery(str)
                        .then(function(result){
 
                            next();
                        })
                        .catch(function(err){
                            //cant find poi_of_user
                        })
                        //res.send(result);
                        
                    })
                    .catch(function (err) {
                        console.log("error creating user object");
                    });
            }

        });

    }
    else {
        next();
    }

});



app.get('/', function (req, res) {
    //var token = app.get('token');
    console.log(token);
    if (token) {
        //var user = app.get('user');
        str = "hello " + user.username;
        res.send(str);
    }
    else {
        res.send("hello guest");
    }



    console.log(req);

})








var port = 4000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


var users = require('./routes/users');
app.use('/users',users);
var poi = require('./routes/pois')
app.use('/poi',poi)
