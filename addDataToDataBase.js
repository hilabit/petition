const spicedPg = require("spiced-pg");
const bcrypt = require('bcryptjs');

let dataBase;
if (!process.env.DATABASE_URL) {
	const secrets = require('./secrets.json')
	dataBase = spicedPg(`postgres:${secrets.dbUser}:${secrets.dbPass}@localhost:5432/signatures`);

} else {
	dataBase = spicedPg(process.env.DATABASE_URL);
}

//==============================================================================================
//==============LOG OUT===================

exports.logOut = () => {
	return request.session = null
}

//==================hash password=============

exports.hashpass = function(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}


//===========register==============

exports.register = ({first, last, email, hashedpass}) => {
	return dataBase.query (`INSERT INTO users (first, last, email, hashedpass)
							VALUES ($1, $2, $3, $4)
							RETURNING userid`, [first, last, email, hashedpass])
	.then((result) => {
		console.log("result.rows[0]", result.rows[0]);
		return result.rows[0].userid;
	});
}

//=========get login pass===========
exports.loginpass = ({email, hashedpass}) => {
	return dataBase.query ('SELECT hashedpass FROM users WHERE email = $1',[email])
	.then((result) => {
		return result.rows;
	})
}


//================check password=========

exports.checkpass = function(password, hashedpass) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(password, hashedpass, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}


//==========================================

//===ADD INFO============================

exports.addInfo = ({age, city, homepage, userid}) => {
	return dataBase.query (`INSERT INTO user_profiles (age, city, homepage, userid)
							VALUES ($1, $2, $3, $4)
							RETURNING userid`, [age || null , city || null, homepage || null, userid])
	.then((results) => {
		console.log("results:", results);
		return results.rows[0].userid
	});
}



exports.sign = ({ sig, userid }) => {
    return dataBase.query (`INSERT INTO signatures (sig, userid)
                             VALUES ($1, $2)
                             RETURNING sigid`, [sig, userid])
    .then((results) => {
        console.log("this is the sig id being returned",results.rows[0].sigid);
        return results.rows[0].sigid;

    });
}




exports.getCountId = () => {
    return dataBase.query(`SELECT COUNT (*) FROM signatures`)
    .then((result) => {
        console.log("getCountId", result.rows[0]);
        return result.rows[0].count;
    })
}

exports.getSigImg = (sigImg) => {
    return dataBase.query(`SELECT sig FROM signatures WHERE sigId = $1`, [sigImg])
    .then((result) => {
        return result.rows[0].sig;
    })
}

exports.getSigners = () => {
    return dataBase.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city
						 	FROM users JOIN user_profiles
							ON users.userid = user_profiles.userid
							LIMIT 10`)
    .then((result) => {
        console.log("result:",result);
        return result.rows;
    })
}


exports.getCreds = (userid) => {
	return dataBase.query(`SELECT users.first, users.last, users.email,
							user_profiles.age, user_profiles.city, user_profiles.homepage
							FROM users
							JOIN user_profiles
							ON users.userid = user_profiles.userid
							WHERE user_profiles.userid = $1`, [userid])
	.then((results) => {
		return results.rows[0]
	})
}

exports.editCreds = ({first, last, email, age, city, homepage, userid}) => {
	console.log("i'm in");
	return dataBase.query(`UPDATE users SET first = $1, last = $2, email = $3
							WHERE userid = $4`, [first, last, email, userid])
	.then(() => {
		console.log("userid", userid)
		return dataBase.query(`UPDATE user_profiles SET age = $1, city = $2, homepage = $3
			 					WHERE userid = $4`, [age, city, homepage, userid])

	})
}


exports.insertNewpass = ({userid, newpass}) => {
	return dataBase.query(`UPDATE users SET hashedpass = $2
							WHERE userid = $1`, [userid, newpass])
}

exports.citySigners = ( city ) => {
	return dataBase.query(`SELECT users.first, users.last, user_profiles.age
		 					FROM users
							JOIN user_profiles
							ON users.userid = user_profiles.userid
							 WHERE user_profiles.city = $1`, [city])
	.then((results) => {
		return results.rows[0]
	})
}
