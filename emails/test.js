require('dotenv').config()
const mailgun = require("mailgun-js");
require('dotenv').config({path:'../.env'})
const mg = mailgun({
    apiKey: process.env.APIKEY, 
    domain: process.env.DOMAIN
    // host: "api.eu.mailgun.net"
});

const welcomeEmail = (email,name)=>{
	const data = {
		from: 'rajatmohan@smarty.com',
		to: email,
		subject: 'Thanks for signing up!',
		text: `Hello ${name}, We are glad to have you onboard captain!`
	};
	mg.messages().send(data, function (error, body) {
		if(!error) console.log(body)
		else console.log(error)
	});

}

const cancelEmail = (email,name)=>{
	const data = {
		from: 'rajatmohan@smarty.com',
		to: email,
		subject: 'We Are Sad To See You Leave!',
		text: `Hello ${name}, We are extremely sorry that you had to leave, Spare a few moments to tell us what went wrong, So we can serve you better next time..`
	};
	mg.messages().send(data, function (error, body) {
		if(!error) console.log(body)
		else console.log(error)
	});

}

module.exports = {
	welcomeEmail,
	cancelEmail
}
