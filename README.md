# Cowin Availability

Check for cowin slots for vaccination for next 7 days, using multiple pincodes.

### Some key highlights :

* Mail will be triggered if the slot is available.
* Mail will be sent from the mail id that would be given in `MAIL_FROM` of `.env` file.
* Mail will be sent to the mail id that would be given in `MAIL_TO` of `.env` file.
* Multiple pincodes can be provided in the `.env` (comma separated)
* Api will be called every (total number of pincodes) x (5 seconds)

Create a `.env` file in the following pattern :

```
SENDGRID_API_KEY=<Sendgrid api key>
MAIL_FROM=<Mail id from which the mail will be sent>
MAIL_TO=<Mail id to which the mail will be sent>
PINCODES=110001,110002