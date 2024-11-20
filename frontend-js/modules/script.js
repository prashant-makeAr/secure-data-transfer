
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

            const secretKey = forge.random.getBytesSync(16);

            const cipher = forge.cipher.createCipher('AES-CBC', secretKey);
            const iv = forge.util.createBuffer(new Uint8Array(16));
            cipher.start({ iv });
            cipher.update(forge.util.createBuffer(data, 'utf8'));
            cipher.finish();
            const encryptedData = forge.util.encode64(cipher.output.bytes());

            const encryptedSecretKey = forge.util.encode64(publicKey.encrypt(secretKey, 'RSA-OAEP'));

            return { encryptedData, encryptedSecretKey };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    }

    async function sendToServer(encryptedPayload) {
        try {
            const response = await fetch('/send-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(encryptedPayload),
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
            const encryptedPayload = await encryptData(data);
            await sendToServer(encryptedPayload);
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
