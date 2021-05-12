const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let timeInterval = 0;
const pincodesString = process.env.PINCODES;
const pincodes = pincodesString.split(',')
timeInterval = !!pincodes.length ? pincodes.length * 5000 : Number.MAX_SAFE_INTEGER

const checkForAvailability = async (pincode, date) => {
    try {
        const res = await axios({
            method: 'get',
            url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
            }
        })
        const centers = _.get(res, 'data.centers', [])
        filterCentersAvailability(centers)
    } catch (error) {
        console.log(error)
        console.log('cowin api not called')
    }
}

const filterCentersAvailability = async (centers) => {
    let isAvailable = 0;
    let mailText = ''
    centers.forEach(center => {
        _.get(center, 'sessions', []).forEach((session) => {
            if (session.available_capacity > 0 && session.min_age_limit === 18) {
                isAvailable = 1;
                const logText = `${session.vaccine} vaccine is available on ${session.date} at pincode: ${center.pincode}`
                mailText = `${mailText}\n${logText}`
                console.log(logText)
            }
        })
    });
    if (isAvailable) {
        const msg = {
            to: process.env.MAIL_TO,
            from: process.env.MAIL_FROM, // Use the email address or domain you verified above
            subject: 'Cowin availability',
            text: mailText
        };
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.log('mail did not send')
        }
    } else {
        console.log('not available')
    }
}

setInterval(() => {
    pincodes.forEach((pincode) => {
        checkForAvailability(pincode, moment().format('DD-MM-YYYY'))
    })
}, timeInterval);