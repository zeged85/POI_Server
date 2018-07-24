var jwt = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var util = require('util')
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./../DButils');


var router = express.Router();
module.exports = router;

app.set('superSecret', '1234');
//var user;
//var token;
var questions = ["what is your pet's name?", "what is your mother's maiden name?", "what is your favorite food?"];
//var countries = []

var fs = require('fs');
xml2js = require('xml2js');
var parser = new xml2js.Parser();

var countries = [];
fs.readFile('./countries.xml', function (err, data) {
    parser.parseString(data, function (err, result) {
        // cb(result.xml.record)
        //res.send(result);
        var countriesArray = result['Countries']['Country']
        for (var i = 0; i <= countriesArray.length - 1; i++) {
            countries.push(countriesArray[i].Name)
        }
        console.log(countries)
    });
    //console.log(countries)
});

router.get('/reg', function (req, res) {
    //var token = req.body.token || req.query.token || req.headers['x-access-token'];
    //token = app.get('token');


    //console.log(countries)

    var tstobj = {
        questions: questions,
        countries: countries
    }



    res.send(tstobj);

});


router.post('/reg', function (req, res) {
    console.log('in reg')
    if (req.body.username && req.body.password) {

        var username = req.body.username;
        var password = req.body.password;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var country = req.body.country;
        //var question = req.body.question;
        var answer1 = req.body.answer1;
        var answer2 = req.body.answer2;
        var answer3 = req.body.answer3;
        var category1 = req.body.category1;
        var category2 = req.body.category2;
        var category3 = req.body.category3;
        var category4 = req.body.category4;


        var usernew = 'POI_of_' + username;
        var tst = util.format("INSERT INTO Users ([username],[firstname] ,[lastname], [password], [email], [country], [answer1], [answer2], [answer3], [category1],[category2],[category3],[category4] ) VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');", username, firstname, lastname, password, email, country, answer1, answer2, answer3, category1, category2, category3, category4);
        DButilsAzure.execQuery(tst)
            .then(function (result) {

                var tst2 = "CREATE TABLE " + usernew + " ( id int );";
                DButilsAzure.execQuery(tst2)

                    .then(function (result) {
                        //res.send(result);
                        console.log(result)
                    })
                    .catch(function (err) {
                        console.log(err);
                    });

            })
            .catch(function (err) {
                console.log(err);
                res.send('user already exists in dataBase');
                // user already exists in dataBase
            })

        //user added to DB
        //send user a token
        var payload = {
            userName: username,
            admin: true
        }


        token = jwt.sign(payload, app.get('superSecret'));
        //app.set('token', token)
        res.send(token);
    }
    else {
        console.log(req.body)
        res.send('missing data in filling form:');
    }
})



router.get('/log', function (req, res) {
    // var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // token = app.get('token');
    if (token) {

        req.decoded = decoded; // decoded.payload , decoded.header
        var username = decoded.userName;
        res.send("login as " + username + "?");

    }
    else {
        res.send("please enter username and password");
        //show log-in
        //enter username
        //enter password
    }
});



router.post('/log', function (req, res) {
    if (req.body.username && req.body.password) {


        var password = req.body.password;
        var username = req.body.username;
        var usernew = 'POI_of_' + username;
        //var tst = "INSERT INTO [Users] ([username],[firsname] ,[lastname], [password], [country], [email] ) VALUES ('" + username + "', 'rtyu', '123456');";
        var str = util.format("select * from Users where username = '%s';", username);

        DButilsAzure.execQuery(str)
            .then(function (result) {
                // res.send(result)
                // console.log(result);

                if (result.length < 1) {
                    console.log('username not found');
                    res.statusCode = 401
                    res.send('username not found')
                }
                else {
                    if (result[0]['password'] == password) {
                        console.log('password ok');

                        //send token

                        var payload = {
                            userName: username,
                            admin: true
                        }


                        var token = jwt.sign(payload, app.get('superSecret'));
                        app.set('token', token)
                        res.send(token);


                    }
                    else {
                        console.log('wrong password');
                        res.statusCode = 401
                        res.send('wrong password');
                    }
                }


            })
            .catch(function (err) {
                console.log(err);
            })

    }
    else {
        res.send('missing data');
    }
})






router.get('/retrievePassword', function (req, res) {


    /*


    show questions listbox
    username enterybox
    answer entrybox

    */
    console.log(req.query)

    var username = req.query.username
    var str = util.format("select * from Users where username = '%s';", username);

    DButilsAzure.execQuery(str)
        .then(function (result) {

            var answer1 = Boolean(result[0]['answer1'])
            var answer2 = Boolean(result[0]['answer2'])

            let ans = {
                answer1: answer1,
                answer2: answer2,
            }
            res.send(ans)
        })
        .catch(function (err) {
            console.log(err);
            res.send('username not found');

        })


    // str = "enter a username and answer the question";
    // res.send(str);

})



router.post('/retrievePassword', function (req, res) {

    console.log("in ret password")
    console.log(req.body)
    if (req.body.username && req.body.answer) {



        var username = req.body.username;
        var answer = req.body.answer;


        var str = util.format("select * from Users where username = '%s';", username);

        DButilsAzure.execQuery(str)
            .then(function (result) {



                if (answer === result[0]['answer1'] || answer === result[0]['answer2']) {

                    var password = result[0]['password']
                    str = "your password is " + password;
                    res.send(str);
                }
                else {
                    str = "your answer is wrong";
                    res.send(str);
                }
            })
            .catch(function (err) {
                console.log(err);
                res.send('there was an error');

            })

    }
})


router.get('/getCategories', function (req, res) {
    console.log('in cats')
    if (token) {

        var username = user.username;
        // var username = user.username;
        //var answer = req.body.answer;
        console.log(username)

        var str = util.format("select * from Users where username = '%s';", username);

        console.log(str)
        DButilsAzure.execQuery(str)
            .then(function (result) {

                let category1 = result[0]['category1'] == "true"
                let category2 = result[0]['category2'] == "true"
                let category3 = result[0]['category3'] == "true"
                let category4 = result[0]['category4'] == "true"

                let categories = {
                    category1: category1,
                    category2: category2,
                    category3: category3,
                    category4: category4,
                }

                res.send(categories);

            })
            .catch(function (err) {
                console.log(err);
                res.send('there was an error');

            })

    }
    else {
        res.send('unknown user')
    }

});


 

