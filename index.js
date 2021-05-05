const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const checkForAvailability = async (pincode, date) => {
    try {
        const res = await axios({
            method: 'get',
            url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`,
            withCredentials: true,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        const centers = _.get(res, 'data.centers', [])
        filterCentersAvailability(centers)
    } catch (error) {
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
                mailText = `${mailText}\n${session.vaccine} vaccine is available on ${session.date}`
                console.log(`${session.vaccine} vaccine is available on ${session.date}`)
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
    checkForAvailability(process.env.PINCODE, moment().format('DD-MM-YYYY'))
}, 20000);