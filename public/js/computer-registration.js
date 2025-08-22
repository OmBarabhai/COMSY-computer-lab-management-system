document.addEventListener('DOMContentLoaded', () => {

    // Grab elements safely
    const loadingOverlay = document.getElementById('loadingOverlay');
    const statusMessage = document.getElementById('statusMessage');
    const specsError = document.getElementById('specsError');
    const retryButton = document.getElementById('retryButton');
    const registrationForm = document.getElementById('computerRegistrationForm');
    const darkModeToggle = document.getElementById('toggle');

    // Retry button for specs fetch
    if (retryButton) {
        retryButton.addEventListener('click', async () => {
            if (specsError) specsError.style.display = 'none';
            retryButton.style.display = 'none';
            await updateSpecsDisplay();
        });
    }

    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            document.body.dataset.theme = darkModeToggle.checked ? 'dark' : 'light';
        });
    }

    // Fetch system specs safely with fallback
    async function fetchSystemSpecs() {
        try {
            const response = await fetch('http://localhost:4000/api/specs', {
                signal: AbortSignal.timeout(5000)
            });
            if (!response.ok) throw new Error('Failed to fetch specs');
            return await response.json();
        } catch (error) {
            console.warn('Error fetching specs, using fallback data:', error);
            return {
                cpu: navigator.hardwareConcurrency + ' cores',
                ram: 'Unknown',
                os: navigator.platform,
                network: 'Unknown',
                ipAddress: '127.0.0.1',
                macAddress: 'Not detected',
                storage: 'Unknown',
                networkSpeed: { download: 0, upload: 0, ping: 0 },
                hardwareConnected: {
                    keyboard: true,
                    mouse: true,
                    monitor: true,
                    headphone: false,
                    microphone: false,
                    pendrive: false
                }
            };
        }
    }

    // Update UI with system specs safely
    async function updateSpecsDisplay() {
        try {
            const specs = await fetchSystemSpecs();

            // Update text content safely
            const cpuInfo = document.getElementById('cpuInfo');
            const ramInfo = document.getElementById('ramInfo');
            const osInfo = document.getElementById('osInfo');
            const networkInfo = document.getElementById('networkInfo');
            const storageInfo = document.getElementById('storageInfo');
            const macInfo = document.getElementById('macInfo');

            if (cpuInfo) cpuInfo.textContent = specs.cpu ?? 'N/A';
            if (ramInfo) ramInfo.textContent = specs.ram ?? 'N/A';
            if (osInfo) osInfo.textContent = specs.os ?? 'N/A';
            if (networkInfo) networkInfo.textContent = specs.network ?? 'N/A';
            if (storageInfo) storageInfo.textContent = specs.storage ?? 'N/A';
            if (macInfo) macInfo.textContent = specs.macAddress ?? 'Not detected';

            // Hardware connected list
            const hardwareList = document.getElementById('hardwareList');
            if (hardwareList) {
                const hardware = specs.hardwareConnected ?? {};
                let hardwareHTML = '<h4>Connected Hardware</h4><ul>';
                for (const [device, connected] of Object.entries(hardware)) {
                    hardwareHTML += `<li><strong>${device}:</strong> ${connected ? '✔ Connected' : '✖ Not connected'}</li>`;
                }
                hardwareHTML += '</ul>';
                hardwareList.innerHTML = hardwareHTML;
            }

            // Network speed display
            const speedInfo = document.getElementById('speedInfo');
            if (speedInfo) {
                const ns = specs.networkSpeed ?? { download: 0, upload: 0, ping: 'N/A' };
                speedInfo.innerHTML = `<h4>Network Speed</h4>
                    <p>Download: ${Number(ns.download ?? 0).toFixed(2)} Mbps</p>
                    <p>Upload: ${Number(ns.upload ?? 0).toFixed(2)} Mbps</p>
                    <p>Ping: ${ns.ping ?? 'N/A'} ms</p>`;
            }

            // Hide error UI if present
            if (specsError) specsError.style.display = 'none';
            if (retryButton) retryButton.style.display = 'none';

        } catch (err) {
            console.error('Error updating specs display:', err);
            if (specsError) {
                specsError.style.display = 'block';
                specsError.textContent = 'Failed to load system specifications.';
            }
            if (retryButton) retryButton.style.display = 'block';
        }
    }

    // Form submission safely
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            try {
                const specs = await fetchSystemSpecs();
                const computerName = document.getElementById('computerName')?.value ?? 'Unnamed';

                const formData = {
                    name: computerName,
                    ipAddress: specs.ipAddress ?? 'N/A',
                    macAddress: specs.macAddress ?? 'N/A',
                    specs: {
                        cpu: specs.cpu ?? 'N/A',
                        ram: specs.ram ?? 'N/A',
                        storage: specs.storage ?? 'N/A',
                        os: specs.os ?? 'N/A',
                        network: specs.network ?? 'N/A',
                        hardwareConnected: specs.hardwareConnected ?? {}
                    },
                    networkSpeed: specs.networkSpeed ?? {},
                    powerStatus: 'on'
                };

                console.log('Form data being sent:', formData);

                const response = await fetch('/api/computers/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error(await response.text());

                alert('Computer registered successfully!');
                window.location.href = '/dashboard.html';

            } catch (err) {
                console.error('Registration failed:', err);
                if (statusMessage) {
                    statusMessage.style.display = 'block';
                    statusMessage.textContent = `Error: ${err.message}`;
                }
            } finally {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }
        });
    }

    // Initialize specs display and refresh every minute
    updateSpecsDisplay();
    setInterval(updateSpecsDisplay, 60000);

});
