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

var questions = ["what is your pet's name?", "what is your mother's maiden name?", "what is your favorite food?"];
var countries = ["Australia", "Bolivia", "China", "Denemark", "", "", "", "", "", "", "", "", "", ""]
app.get('/Insert', function (req, res) {
    //"INSERT INTO [Persons] ([LastName], [FirstName], [Adress], [City] ) VALUES ('isreal','israeli','street','city')"
    DButilsAzure.execQuery("CREATE TABLE Persons (PersonID int, Username varchar(255));")
        //DButilsAzure.execQuery("INSERT INTO Persons ([Name]) VALUES ( 'two');")
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err)
        })
    //res.send("dsfgdfg");
});
app.set('superSecret', '1234');

app.use('/reg', function (req, res) {
    if (req.body.username) {

        /*  //DButilsAzure.execQuery("SELECT * FROM Users WHERE id = '4';")
            .then(function (result) {
                res.send(result)
            })
            .catch(function (err) {
                console.log(err)
            })
    
DButilsAzure.execQuery("INSERT INTO [Users] ([id]) VALUES ('4');");
//CREATE - POI TABLE*/
        var password = req.body.password;
        var username = req.body.username;
        var usernew = 'POI_of_' + username;
        var tst = "INSERT INTO [Users] ([username],[firsname] [lastname], [password], [country], [email] ) VALUES ('" + username + "', 'rtyu', '123456');";
        DButilsAzure.execQuery(tst)
            .then(function (result) {
                // res.send(result)

                var tst2 = "CREATE TABLE " + usernew + " ( id int );";
                DButilsAzure.execQuery(tst2)
                    .then(function (result) {
                        //res.send(result);
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
        var payload = {
            userName: username,
            admin: true
        }
        app.set('token', '')

        var token = jwt.sign(payload, app.get('superSecret'));
        res.send(token);
    }
})

app.use('/', function (req, res,next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    app.set('token', token);
   
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: "fail" });
            }
            else {
                req.decoded = decoded; // decoded.payload , decoded.header
                // res.send(req.decoded)
                var myuser = decoded.userName;
                app.set('username', myuser);
                console.log(app.get('username'));
                var soh = "SELECT * FROM Users WHERE username = '" + myuser + "' ;";

                DButilsAzure.execQuery(soh)
                    .then(function (result) {
                        // res.send(result);

                    })
                    .catch(function (err) {
                        console.log(err);
                    });                   
            }

        });

    }
next();
});


app.get('/log', function (req, res) {
    // var token = req.body.token || req.query.token || req.headers['x-access-token'];
    token = app.get('token');
    if (token) {

        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: "fail" });
            }
            else {
                req.decoded = decoded; // decoded.payload , decoded.header
                res.send(app.get('username'));
                next();
            }
        });
    }
});


app.use('/addToFavorites', function (req, res) {
    var username = app.get('username');
    var usernew = util.format("POI_of_'%s'",username);
    var id = parseInt(req.query.poi_id,10) ;
    res.send(req.query);
    console.log(usernew);

   var str = util.format("INSERT INTO POI_of_ayeletpop ([id]) VALUES ('%s');", id);
   DButilsAzure.execQuery(str);
})


app.post('/retrievePassword',function(req,res){

})


//////////  WRITE ROUTES AND db REQURESTS HERE, LOOK AT SLIDE 20 


var port = 4000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


