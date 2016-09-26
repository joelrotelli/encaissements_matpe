var moment = require('moment');
var nodemailer = require('nodemailer');// create reusable transporter object using the default SMTP transport

//SET SMTP CONNECTION INFOS HERE
var transporter = nodemailer.createTransport('smtps://you%40domain.com:password@auth.smtp.domain.com');
var language = 'fr';
var rest = require('node-rest-client');
var firm_id = YOUR_FIRM_ID

var Client = rest.Client;

// configure basic http auth for every request
var options_auth = {user:  MPATPE_USER , password: MPATPE_PASSWORD};

var client = new Client(options_auth);

var args = {
    headers: {
        "User-Agent": "Encaissements <you@domain.com>",
    }
};


var now = moment();
var period = now.locale(language).subtract(1, 'months');
var period_start = period.format('MM/YYYY');
var period_end = period_start;
var date_name = period.format('MMMM YYYY');


// direct way
client.get("https://www.facturation.pro/firms/ "+ firm_id + "/invoices.json?bill_type=paid&period_start=" + period_start + " &period_end=" + period_end, args, function (invoices, response) {
    // parsed response body as js object
    //console.log(invoices);

    var totalAmount = 0;
    var totalAmountVAT = 0;
    var totalVAT = 0;
    invoices.forEach(function (invoice) {
        totalAmount = parseFloat(invoice.total) + parseFloat(totalAmount);
        totalAmountVAT = parseFloat(invoice.total_with_vat) + parseFloat(totalAmountVAT);
        totalVAT = parseFloat(invoice.total_with_vat) + parseFloat(invoice.total)
    });


    console.log('Encaissements HT : ' + totalAmount);
    console.log('Encaissements TTC : ' + totalAmountVAT);
    console.log('TVA collectée : ' + totalVAT);


    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'you@domain.com', // sender address
        to: 'your.accountant@society.com', // list of receivers
        subject: 'Encaissements ' + date_name, // Subject line
        html: 'Bonjour,<br /><br />Voici les encaissements de '+ date_name + ' : ' +
        '<br /><br /><b>Encaissements HT :</b> ' + totalAmount + ' €<br /><b>Encaissements TTC :</b> ' + totalAmountVAT + ' €<br />' +
        '<b>TVA collectée :</b> ' + totalVAT + ' € '
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            messageRobot = error;
            var mailOptions = {
                from: 'you@domain.com', // sender address
                to: 'you@domain.com', // list of receivers
                subject: messageRobot, // Subject line
                html: messageRobot
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
});
