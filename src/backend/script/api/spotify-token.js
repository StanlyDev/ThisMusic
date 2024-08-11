import fetch from 'node-fetch';

export default async (req, res) => {
    const client_id = '8b6fe43adf434898aadfa61415c23ebe';
    const client_secret = 'e338596c25d94b02abe305388455ec1f';

    const authOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(response.status).json({ error: data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
