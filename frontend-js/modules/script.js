export default function Script() {
    console.log("Script is connected");


    async function fetchPublicKey() {
        try {
            const response = await fetch('/public_key.pem');
            if (!response.ok) {
                throw new Error(`Failed to fetch public key: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching public key:', error);
            throw new Error('Unable to retrieve public key for encryption.');
        }
    }

    async function encryptData(data) {
        try {
            const publicKeyPem = await fetchPublicKey();
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

            const secretKey = forge.random.getBytesSync(16);

            const iv = forge.random.getBytesSync(16);

            const cipher = forge.cipher.createCipher('AES-CBC', secretKey);
            cipher.start({ iv });
            cipher.update(forge.util.createBuffer(data, 'utf8'));
            cipher.finish();
            const encryptedData = forge.util.encode64(cipher.output.bytes());

            const encryptedSecretKey = forge.util.encode64(
                publicKey.encrypt(secretKey, 'RSA-OAEP')
            );

            return {
                encryptedData,
                encryptedSecretKey,
                iv: forge.util.encode64(iv),
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Data encryption failed.');
        }
    }

    async function sendToServer(encryptedPayload) {
        try {
            const response = await fetch('/data', {
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
            alert(error.message || 'Something went wrong while sending data.');
        }
    }


    async function encryptAndSendData() {
        const dataEl = document.getElementById('data');
        const data = dataEl.value.trim();

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
    submitBtn.addEventListener('click', encryptAndSendData);
}
