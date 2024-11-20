export default function Script() {
    console.log("Script is connected");

    async function encryptData(data) {
        try {
            const publicKeyFetchResponse = await fetch('/public_key.pem');
            if (!publicKeyFetchResponse.ok) {
                throw new Error('Failed to fetch public key');
            }
            const publicKeyPem = await publicKeyFetchResponse.text();
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

            const encryptedData = publicKey.encrypt(forge.util.encodeUtf8(data), 'RSA-OAEP');
            return forge.util.bytesToHex(encryptedData);
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    }

    async function sendToServer(score) {
        try {
            const response = await fetch('/send-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });

            const parsedResponse = await response.json();
            if (!response.ok) {
                throw new Error(parsedResponse.message || 'Failed to send data');
            }
            alert(parsedResponse.message);
        } catch (error) {
            console.error('Server error:', error);
            alert(error.message || 'Something went wrong while sending data');
        }
    }

    async function encryptAndSendData() {
        const dataEl = document.getElementById('data');
        const data = dataEl.value;

        if (!data) {
            alert('Please provide data to encrypt.');
            dataEl.focus();
            return;
        }

        try {
            const score = await encryptData(data);
            await sendToServer(score);
        } catch (error) {
            alert(error.message);
        } finally {
            dataEl.value = '';
            dataEl.focus();
        }
    }

    const submitBtn = document.querySelector('#btn');
    submitBtn.addEventListener("click", encryptAndSendData);
}
