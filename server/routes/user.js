import { Router } from "express";
import fetch from "node-fetch";


const router = Router();
const CLIENT_ID = `${process.env.GOOGLE_CLIENT_ID}.apps.googleusercontent.com`;
const AUTHORISED_EMAILS = process.env.ALLOWED_EMAIL_LIST.split(",");


async function verifyUser(userToken) {
    const userPayload = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${userToken}`, {
        method: "GET"
    });
    const userObj = await userPayload.json();

    if (userObj.email_verified != "true") {
        console.debug("Email is not verified", userObj.email);
        return false;
    };
    if (!AUTHORISED_EMAILS.includes(userObj.email)) {
        console.debug("Email is not allowed", userObj.email);
        return false;
    };
    const expiry = new Date(parseInt(userObj.exp) * 1000);
    if (expiry <= new Date()) {
        console.debug("Token has expired");
        return false;
    };
    return true;
};


router.post('/auth', async function(req, res) {
    const header = req.headers['authorization'];
    var token = "";
    if (header && header.startsWith("Bearer ")) {
        token = header.substring(7, header.length);
    };
    if (await verifyUser(token)) {
        res.status(200).end();
    } else {
        res.status(401).end();
    };
});

export default router;