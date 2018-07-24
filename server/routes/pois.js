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
var router=express.Router();
module.exports = router;

router.get('/getPOIs', function(req,res){

    var str = util.format("select * from POIs;");
    DButilsAzure.execQuery(str)
        .then(function (result) {
           POIs = result;
           console.log(POIs)
           console.log("why no change?")
           res.send(result)
        })
        .catch(function(err){
            console.log(err)
            //cant find poi_of_user
            //console.log(err)
        })
})

router.get('/getFavorites', function(req,res){
    console.log('in favs')
    if (token){

        var username = user.username;
        var usernew = "POI_of_" + username;
        //var id = req.body.poi_array;
        var query = "select * from POI_of_" + username + ";"

        DButilsAzure.execQuery(query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                console.log(err);
                res.send([])
            })



    }
    else{
        res.send([])
    }

})

router.post('/saveFavorites', function (req, res) {
    console.log('saving favs')
    if (token) {
        var username = user.username;
        var usernew = "POI_of_" + username;
        var id = req.body.poi_array;
        console.log(req.body)
        var query = "INSERT INTO POI_of_" + username + " ([id]) VALUES ("
        if (Array.isArray(id)) {
            query+=id[0]+")"
            console.log("array!")
            for (var i=1; i<id.length; i++){
                query+= ", ("+ id[i] + ")"
            }
            query+=";"

        }
        else {
            console.log("not array")
            query+=id+");"

        }
        //var id = parseInt(req.body.poi_array[0], 10);
        //res.send(req.query);
        console.log(query);

        //var str = util.format("INSERT INTO POI_of_ayeletpop ([id]) VALUES ('%s');", id);
        var resetTable = "delete from POI_of_" + username + ";"
        DButilsAzure.execQuery(resetTable)
        .then(function (result) {
            
       

        DButilsAzure.execQuery(query)
            .then(function (result) {
                res.send("POI " + id + " added to " + username + "'s list");
            })

        })
            .catch(function (err) {
                console.log(err);

            })
    }
    else {
        res.send('unregisted user');
    }
})


router.post('/postReview', function (req, res) {

    //var usernew = 'POI_of_' + username;
    if (token) {
        //res.send(user.username)
        user = app.get('user');
        var username = user.username;
        var review = req.body.review;
        var daytime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        console.log("id=" + req.body.id);

        var id = "Reviews_of_" + req.body.id;
        //res.send(daytime);
        var tst = util.format("INSERT INTO Reviews_of_1 (username,review ,daytime ) VALUES ('%s','%s','%s');", username, review, daytime);
        DButilsAzure.execQuery(tst)

            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                res.send(err);
                console.log(err);
            });


    }
    else {
        res.send('unregisterd user')
    }
});


router.post('/postRank', function (req, res) {

    if (token) {
        var rank = req.body.rank;
        var id = req.body.poi;
        console.log('posting rank')
        var tst = "select * from POIs where id="+id+";"
        
        DButilsAzure.execQuery(tst)
            .then(function (result) {

                console.log(result);
                var score = parseInt(rank, 10);
                var newrank = result[0]['total_score'] + score;
                var newnum = result[0]['num_of_votes'] + 1;
                console.log('new rank =' + newrank);
                //var tst2 = "CREATE TABLE " + usernew + " ( id int );";
                var tst2 = util.format("update POIs set total_score='%s' where id='%s';", newrank, id);

                DButilsAzure.execQuery(tst2)
                    .then(function (result) {
                        //res.send(result);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });


                var tst2 = util.format("update POIs set num_of_votes='%s' where id='%s';", newnum, id);

                DButilsAzure.execQuery(tst2)
                    .then(function (result) {
                        //res.send(result);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });

                    res.send("thank you for your vote")

            })
            .catch(function (err) {
                console.log(err);
            });


    }
    else {
        res.send("unregisterd user");
    }

});

router.get('/getPOIdata', function (req, res) {

    var id = parseInt(req.query.id, 10);
    //var id = req.query.id

    if (id) {
        //select * from review_of_'%s' 
        console.log('getting poi data, id=' + id)
        var query = "select * from Reviews_of_" + id + ";";
        // var tst = util.format("select * from Reviews_of_1;", idnew);
        DButilsAzure.execQuery(query)
            .then(function (result) {
                var query = "update POIs set num_of_views = num_of_views + 1 where id=" + id + ";";
                res.send(result);
                DButilsAzure.execQuery(query);
            })
            .catch(function (err) {
                console.log(err);
                res.send("cant find table " + idnew)
            });


        //result.length size
    }
    else {
        //no id given
    }


})