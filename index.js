const addDataToDataBase = require('./addDataToDataBase.js');
const sign = addDataToDataBase.sign;
const getCountId = addDataToDataBase.getCountId;
const getSigImg = addDataToDataBase.getSigImg;
const getSigners = addDataToDataBase.getSigners;
const register = addDataToDataBase.register;
const hashpass = addDataToDataBase.hashpass;
const checkpass = addDataToDataBase.checkpass;
const loginpass = addDataToDataBase.loginpass;
const addInfo = addDataToDataBase.addInfo;
const getCreds = addDataToDataBase.getCreds;
const editCreds = addDataToDataBase.editCreds;
const insertNewpass = addDataToDataBase.insertNewpass;
const citySigners = addDataToDataBase.citySigners;
const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");

let dataBase;
if (!process.env.DATABASE_URL) {
	const secrets = require('./secrets.json')
	dataBase = spicedPg(`postgres:${secrets.dbUser}:${secrets.dbPass}@localhost:5432/signatures`);
} else {
	dataBase = spicedPg(process.env.DATABASE_URL);
}

const express = require('express');
const app = express();
const hb = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');



app.use(cookieSession({
	secret: process.env.SECRET || require('./secrets').secret,
	maxAge: 1000 * 60 * 60 * 24 * 14
}))




app.engine('handlebars', hb({defaultLayout:'layout', css: '../style.css'}));
app.set('view engine', 'handlebars');




app.use(bodyParser.urlencoded({
    extended: false
}));



// ==========================gain access to the public folder ==========================================
app.use(express.static('./public'));

//=====================================================================================================


//===REGISTER=====================================================

app.get('/', (req,res) => {
	res.render('register');
})

app.post('/users', (req,res) => {

	hashpass(req.body.password).then((hashedpass) => {
		req.body.hashedpass = hashedpass;
		console.log("req.body:", req.body);
		if(req.body.first && req.body.last && req.body.email && req.body.password) {
			register(req.body).then((userId) => {
				console.log("user ID:", userId);
				req.session.userid = userId;
				res.redirect('/addInfo');
			}).catch((err) => {
				console.log("error in post request", err);
				res.render('register', {
					error: "fill it out better"
				});
			})
		}
		else {
			res.render('register', {
				error: "fill it out better"
			});
		}
	})

})


//=======LOGIN=====================================================================

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req,res) => {
	if(req.body.email && req.body.password) {
		loginpass(req.body).then((hashedpass) => {
			console.log("hashedpass", hashedpass);
			return checkpass(req.body.password, hashedpass[0].hashedpass)
		}).then((doesMatch) => {
			res.redirect('/addInfo');

		}).catch((err) => {
			console.log("error", err);
			res.render('login', {
				error: "you're wrong"
			})
		})
	} else {
		res.render('login', {
			error: "nope"
		})
	}

})




//====ADD INFO PAGE==============================

app.get('/addInfo', (req, res) => {
	res.render('addInfo');
});


app.post('/addInfo', (req, res) => {
	console.log("got to add Info");

	req.body.userid = req.session.userid;
	console.log("req.body in add info", req.body);
	addInfo(req.body).then((userid) => {
		console.log("userid", userid);
		res.redirect('/home')
	})
	.catch((err) => {
		console.log("error in redirecting from addInfo to home", err);
		res.render('home', {
			error: "your details were not filled out properly but that's ok, you are still loved"
		})
	})
})



app.get('/home', (req,res) => {
	console.log("inside of GET home route");
	res.render('home');
})

app.post('/home', (req, res) => {

	req.body.userid = req.session.userid;
	console.log("this is req.body",req.body);
	console.log("userid", req.body.userid);
    sign(req.body).then((sigId) => {
			console.log("sig id", sigId);
            req.session.sigid = sigId;
            res.redirect('/thankYou');
        })
        .catch((err) => {
            console.log('error in redirecting to those who signed page', err);
			res.redirect('/home', {
				error: "sign better"

		    })

        })

});
//==================================================================================================

//=========thank you page ==================
app.get('/thankYou', (req, res) => {
	console.log("sigId", req.session.sigid);
    getCountId().then((countId) => {
        getSigImg(req.session.sigid)
        .then((sigImg) => {

            res.render('thankYou', {
                num: countId,
                img:sigImg
            })
        })
    })
    .catch((err) => {
        console.log('error in redirecting to those who signed page', err);
    })
})

//======================================================================================================

//=========================names of people who signed==========================


app.get('/thoseWhoSigned', (req, res) => {
	getSigners().then((signersArray) => {
		console.log("signers array", signersArray);
		res.render('thoseWhoSigned', {
            names: signersArray
        })
    })
    .catch((err) => {
        console.log('those who signed error', err);
    })

})
//==============================================================


app.get('/editCreds', (req, res) => {
	console.log("we're in editCreds GET");
	getCreds(req.session.userid).then((results) => {
		console.log("I'm in the edit creds then");
		res.render('editCreds', {
			users: results
		})
	})
	.catch((err) => {
		console.log("error", err);
		res.redirect('/register', {
			error: "you have to register first"
		})
	})
})






app.post('/editCreds', (req, res) => {
	console.log("I'm in edit creds");
	req.body.userid = req.session.userid;
	editCreds(req.body).then(() => {
		console.log("editcreds req.body", req.body);
		if(req.body.password) {
			console.log("req.body password:", req.body.password);
			hashpass(req.body).then((newpass) => {
				insertNewpass({userid, newpass});
				console.log("inserted pass");

			})

		}
		res.redirect('/thoseWhoSigned')

	})
		.catch((err) => {
			console.log("error", err);
			res.redirect('/editCreds', {
				error: "you haven't done it right"
			})

		})

})

app.get('/citySigners/:someCity',(req, res) => {
	console.log("in citySigners");
	console.log("req.params:", req.params);
	const city = req.params.someCity
	citySigners(city).then((results) => {
	res.render('citySigners', {
		users: results
	})
})
})








app.listen(process.env.PORT || 8080, () => console.log(`I'm listening`) );







	//heroku URL:https://hilaspetition.herokuapp.com/
