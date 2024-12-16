
async function fetchPublicKey() {
    try {
        const response = await fetch('/public_key.pem');
        if (!response.ok) {
            throw new Error('Failed to fetch public key');
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching public key:', error);
        throw new Error('Unable to retrieve public key for encryption.');
    }
}

axios.interceptors.request.use(
    async (config) => {
        if (config.data) {
            try {
                const publicKeyPem = await fetchPublicKey();
                const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

                const secretKey = forge.random.getBytesSync(16);
                const iv = forge.random.getBytesSync(16);

                const cipher = forge.cipher.createCipher('AES-CBC', secretKey);
                cipher.start({ iv });
                cipher.update(forge.util.createBuffer(JSON.stringify(config.data), 'utf8'));
                cipher.finish();
                const encryptedData = forge.util.encode64(cipher.output.bytes());

                const encryptedSecretKey = forge.util.encode64(
                    publicKey.encrypt(secretKey, 'RSA-OAEP')
                );

                config.data = {
                    encryptedData,
                    encryptedSecretKey,
                    iv: forge.util.encode64(iv),
                };
            } catch (error) {
                console.error('Encryption error:', error);
                throw new Error('Failed to encrypt request data');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);


//! We will use this when we send encrypted data from server to client
// axios.interceptors.response.use(
// );

export default function Script() {
    console.log("Script is connected");

    async function sendData() {
        const dataEl = document.getElementById('data');
        const data = dataEl.value.trim();

        if (!data) {
            alert('Please provide data to encrypt.');
            dataEl.focus();
            return;
        }

        try {
            const response = await axios.post('/data', { data });
            alert(response?.data?.message)
        } catch (error) {
            console.log(error);
            alert(error?.response?.data?.message);
        } finally {
            dataEl.value = '';
            dataEl.focus();
        }
    }

    const submitBtn = document.querySelector('#btn');
    submitBtn.addEventListener('click', sendData);
}
